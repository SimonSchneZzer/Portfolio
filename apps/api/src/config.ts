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

export const config = {
  apiHost: process.env.API_HOST ?? "0.0.0.0",
  apiPort: readNumber(process.env.API_PORT, 4000),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://192.168.8.50:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:3b",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  kbIndexPath: process.env.KB_INDEX_PATH || resolve(repoRoot, "data/kb-index.json"),
  systemPromptPath: process.env.SYSTEM_PROMPT_PATH || resolve(repoRoot, "knowledge/system-prompt.md"),
  maxContextChunks: readNumber(process.env.MAX_CONTEXT_CHUNKS, 4),
  maxHistoryMessages: readNumber(process.env.MAX_HISTORY_MESSAGES, 6)
};

