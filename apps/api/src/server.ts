import { readFile } from "node:fs/promises";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { config } from "./config.js";
import { assessConversationScope } from "./guardrails.js";
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
    logger: true
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
    model: config.ollamaModel,
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

    const scopeAssessment = assessConversationScope(conversation);
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
        const ollamaMessages = buildOllamaMessages(systemPrompt, conversation, retrieval.chunks);

        await streamOllamaChat({
          baseUrl: config.ollamaBaseUrl,
          model: config.ollamaModel,
          messages: ollamaMessages,
          timeoutMs: config.ollamaRequestTimeoutMs,
          onToken: (token) => {
            writeEvent({
              type: "token",
              token
            });
          }
        });
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
