import { readFile } from "node:fs/promises";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { config } from "./config.js";
import { streamCloudflareChat } from "./cloudflare.js";
import { assessConversationScope, detectLanguage } from "./guardrails.js";
import { loadKnowledgeBase, retrieveRelevantContext } from "./kb.js";
import { streamOllamaChat } from "./ollama.js";
import { buildOllamaMessages } from "./prompt.js";
import type { ChatMessage } from "./types.js";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000)
      })
    )
    .min(1)
    .max(20)
});

function streamText(text: string, writeEvent: (payload: unknown) => void) {
  const chunks = text.match(/\S+\s*/g) ?? [text];

  for (const chunk of chunks) {
    writeEvent({
      type: "token",
      token: chunk
    });
  }
}

const rateLimitWindowMs = 60 * 60 * 1000;
const requestLog = new Map<string, number[]>();

/** Simple in-memory sliding-window limit per client IP, so one visitor cannot drain the free daily quota. */
function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((timestamp) => now - timestamp < rateLimitWindowMs);

  if (recent.length >= config.rateLimitPerHour) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);

  if (requestLog.size > 10000) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((timestamp) => now - timestamp >= rateLimitWindowMs)) {
        requestLog.delete(key);
      }
    }
  }

  return false;
}

const rateLimitReply = {
  de: "Du hast in kurzer Zeit sehr viele Fragen gestellt. Bitte versuch es in einer Stunde wieder oder kontaktiere mich direkt.",
  en: "You have asked a lot of questions in a short time. Please try again in an hour or contact me directly."
};

function getStreamingCorsHeaders(origin: string | undefined) {
  if (!origin || !config.allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin"
  };
}

export async function buildServer() {
  const app = Fastify({
    logger: true,
    // Requests arrive through Caddy, so the client IP is in X-Forwarded-For.
    trustProxy: true
  });

  const knowledgeBase = await loadKnowledgeBase(config.kbIndexPath);
  const systemPrompt = await readFile(config.systemPromptPath, "utf8");

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed"), false);
    }
  });

  app.get("/api/health", async () => ({
    ok: true,
    provider: config.llmProvider,
    model: config.llmProvider === "cloudflare" ? config.cloudflareModel : config.ollamaModel,
    fallbackModel: config.llmProvider === "cloudflare" ? config.ollamaModel : null,
    ollamaBaseUrl: config.ollamaBaseUrl,
    kbGeneratedAt: knowledgeBase.generatedAt,
    kbChunks: knowledgeBase.totalChunks
  }));

  app.get("/api/chat", async (_request, reply) => {
    return reply
      .code(405)
      .header("Allow", "POST, OPTIONS")
      .send({
        error: "Method Not Allowed",
        message: "Use POST /api/chat for streaming chat responses.",
        statusCode: 405
      });
  });

  app.post("/api/chat", async (request, reply) => {
    const parsed = requestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid request body"
      });
    }

    const conversation = parsed.data.messages.slice(-config.maxHistoryMessages) as ChatMessage[];
    const latestUserMessage = [...conversation].reverse().find((message) => message.role === "user");

    if (!latestUserMessage) {
      return reply.code(400).send({
        error: "Missing user message"
      });
    }

    const rateLimited = isRateLimited(request.ip);
    const scopeAssessment = rateLimited
      ? {
          blocked: true,
          reply: rateLimitReply[detectLanguage(latestUserMessage.content)]
        }
      : assessConversationScope(conversation, { strict: config.llmProvider !== "cloudflare" });
    const retrieval = scopeAssessment.blocked
      ? {
          chunks: [],
          sources: []
        }
      : retrieveRelevantContext(knowledgeBase, conversation, config.maxContextChunks);

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      ...getStreamingCorsHeaders(request.headers.origin)
    });

    const writeEvent = (payload: unknown) => {
      reply.raw.write(`${JSON.stringify(payload)}\n`);
    };

    writeEvent({
      type: "sources",
      sources: retrieval.sources
    });

    try {
      if (scopeAssessment.blocked) {
        streamText(scopeAssessment.reply ?? "This chat is limited to my professional profile.", writeEvent);
      } else {
        const writeToken = (token: string) => {
          writeEvent({
            type: "token",
            token
          });
        };
        let answeredByCloud = false;

        if (config.llmProvider === "cloudflare") {
          // The whole knowledge base is small (~6k tokens), so the cloud model gets all of it instead of a keyword subset.
          const cloudMessages = buildOllamaMessages(systemPrompt, conversation, knowledgeBase.chunks);
          let streamedTokens = 0;

          try {
            const startedAt = Date.now();
            const usage = await streamCloudflareChat({
              accountId: config.cloudflareAccountId,
              apiToken: config.cloudflareApiToken,
              model: config.cloudflareModel,
              messages: cloudMessages,
              maxTokens: config.cloudflareMaxOutputTokens,
              timeoutMs: config.cloudflareRequestTimeoutMs,
              onToken: (token) => {
                streamedTokens += 1;
                writeToken(token);
              }
            });

            if (streamedTokens === 0) {
              throw new Error("Cloudflare Workers AI returned an empty answer.");
            }

            answeredByCloud = true;
            request.log.info({ provider: "cloudflare", ms: Date.now() - startedAt, ...usage }, "llm answer");
          } catch (error) {
            // Fall back to Ollama only if nothing was streamed yet; otherwise the answer would be mixed.
            if (streamedTokens > 0) {
              throw error;
            }

            request.log.warn(error, "Cloudflare Workers AI failed, falling back to Ollama");
          }
        }

        if (!answeredByCloud) {
          await streamOllamaChat({
            baseUrl: config.ollamaBaseUrl,
            model: config.ollamaModel,
            messages: buildOllamaMessages(systemPrompt, conversation, retrieval.chunks),
            timeoutMs: config.ollamaRequestTimeoutMs,
            onToken: writeToken
          });
        }
      }

      writeEvent({
        type: "done"
      });
    } catch (error) {
      request.log.error(error);

      writeEvent({
        type: "error",
        message: "The chatbot could not complete the response."
      });
    } finally {
      reply.raw.end();
    }
  });

  return app;
}
