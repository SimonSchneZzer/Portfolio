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

/** Global limits for everyone together (the per-IP limit alone does not stop many addresses at once). */
const load = { active: 0, ollama: 0, day: "", answers: 0, warned: false };

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Counts one answer for today; false once the daily limit is reached. */
function takeDailyAnswer() {
  if (load.day !== today()) {
    load.day = today();
    load.answers = 0;
    load.warned = false;
  }

  if (load.answers >= config.dailyAnswerLimit) {
    return false;
  }

  load.answers += 1;
  return true;
}

/** One ntfy message per day when the limit is hit (schema: Projekt · Stichwort – Detail, see ~/Projects/CLAUDE.md). */
function warnDailyLimit() {
  if (load.warned || !config.ntfyTopic) {
    return;
  }

  load.warned = true;
  fetch("https://ntfy.sh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: config.ntfyTopic,
      title: "Portfolio · Warnung – Chat-Tageslimit erreicht",
      message: `Der Chat hat heute ${config.dailyAnswerLimit} Antworten gegeben und antwortet bis Mitternacht (UTC) nur noch mit einem Hinweis. Ungewöhnlich viel – eventuell Missbrauch.`,
      tags: ["briefcase", "warning"],
      priority: 4,
      click: "http://homeserver/dashboard/#/portfolio"
    })
  }).catch(() => undefined);
}

const busyReply = {
  de: "Gerade stellen sehr viele Leute gleichzeitig Fragen. Bitte versuch es in ein paar Minuten noch einmal.",
  en: "A lot of people are asking at the same time right now. Please try again in a few minutes."
};

const dailyLimitReply = {
  de: "Der Chat hat für heute sein Limit erreicht. Bitte versuch es morgen wieder oder kontaktiere mich direkt.",
  en: "The chat has reached its limit for today. Please try again tomorrow or contact me directly."
};

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
    // Request logs without IP addresses (privacy notice on /legal promises this).
    logger: {
      serializers: {
        req: (request) => ({ method: request.method, url: request.url })
      }
    },
    // Requests arrive through Caddy on the Docker network; only that hop's X-Forwarded-For entry is trusted.
    trustProxy: "172.16.0.0/12"
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

  // Public: no internal addresses or model names.
  app.get("/api/health", async () => ({ ok: true }));

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

    const language = detectLanguage(latestUserMessage.content);
    const rateLimited = isRateLimited(request.ip);
    const busy = !rateLimited && load.active >= config.maxConcurrentAnswers;
    const scopeAssessment = rateLimited
      ? { blocked: true, reply: rateLimitReply[language] }
      : busy
        ? { blocked: true, reply: busyReply[language] }
        : assessConversationScope(conversation, { strict: config.llmProvider !== "cloudflare" });
    // Only answers that really go to a model count against the daily limit.
    if (!scopeAssessment.blocked && !takeDailyAnswer()) {
      warnDailyLimit();
      Object.assign(scopeAssessment, { blocked: true, reply: dailyLimitReply[language] });
    }
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
      if (!reply.raw.destroyed) {
        reply.raw.write(`${JSON.stringify(payload)}\n`);
      }
    };
    // Visitor closed the chat or the connection broke: stop the model instead of letting it run on.
    const visitorGone = new AbortController();
    let finished = false;
    reply.raw.on("close", () => {
      if (!finished) {
        visitorGone.abort();
      }
    });

    writeEvent({
      type: "sources",
      sources: retrieval.sources
    });

    const counted = !scopeAssessment.blocked;
    if (counted) {
      load.active += 1;
    }

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
              signal: visitorGone.signal,
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

        if (!answeredByCloud && !visitorGone.signal.aborted) {
          if (load.ollama >= config.maxConcurrentOllama) {
            // The home server answers only a few at a time; everyone else gets a short note instead of a queue.
            streamText(busyReply[language], writeEvent);
          } else {
            load.ollama += 1;
            try {
              await streamOllamaChat({
                baseUrl: config.ollamaBaseUrl,
                model: config.ollamaModel,
                messages: buildOllamaMessages(systemPrompt, conversation, retrieval.chunks),
                timeoutMs: config.ollamaRequestTimeoutMs,
                maxTokens: config.ollamaMaxOutputTokens,
                signal: visitorGone.signal,
                onToken: writeToken
              });
            } finally {
              load.ollama -= 1;
            }
          }
        }
      }

      writeEvent({
        type: "done"
      });
    } catch (error) {
      if (visitorGone.signal.aborted) {
        request.log.info("visitor closed the chat, answer aborted");
        return;
      }
      request.log.error(error);

      writeEvent({
        type: "error",
        message: "The chatbot could not complete the response."
      });
    } finally {
      finished = true;
      if (counted) {
        load.active -= 1;
      }
      if (!reply.raw.destroyed) {
        reply.raw.end();
      }
    }
  });

  return app;
}
