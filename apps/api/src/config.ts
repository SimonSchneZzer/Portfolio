import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, "../../..");

function readNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export type LlmProvider = "cloudflare" | "ollama";

const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN ?? "";

export const config = {
  apiHost: process.env.API_HOST ?? "0.0.0.0",
  apiPort: readNumber(process.env.API_PORT, 4000),
  // "cloudflare" uses Workers AI first and falls back to Ollama; "ollama" uses only Ollama.
  llmProvider: (process.env.LLM_PROVIDER === "cloudflare" && cloudflareAccountId && cloudflareApiToken
    ? "cloudflare"
    : "ollama") as LlmProvider,
  cloudflareAccountId,
  cloudflareApiToken,
  cloudflareModel: process.env.CLOUDFLARE_MODEL ?? "@cf/google/gemma-4-26b-a4b-it",
  cloudflareRequestTimeoutMs: readNumber(process.env.CLOUDFLARE_REQUEST_TIMEOUT_MS, 30000),
  cloudflareMaxOutputTokens: readNumber(process.env.CLOUDFLARE_MAX_OUTPUT_TOKENS, 700),
  rateLimitPerHour: readNumber(process.env.RATE_LIMIT_PER_HOUR, 30),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://192.168.8.50:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:3b",
  ollamaRequestTimeoutMs: readNumber(process.env.OLLAMA_REQUEST_TIMEOUT_MS, 120000),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  kbIndexPath: process.env.KB_INDEX_PATH || resolve(repoRoot, "data/kb-index.json"),
  systemPromptPath: process.env.SYSTEM_PROMPT_PATH || resolve(repoRoot, "knowledge/system-prompt.md"),
  maxContextChunks: readNumber(process.env.MAX_CONTEXT_CHUNKS, 4),
  maxHistoryMessages: readNumber(process.env.MAX_HISTORY_MESSAGES, 6)
};
