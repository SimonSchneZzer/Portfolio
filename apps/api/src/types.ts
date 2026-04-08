export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface StreamSource {
  label: string;
  file: string;
  section: string | null;
}

export interface KBChunk {
  id: string;
  file: string;
  fileBase: string;
  title: string;
  section: string | null;
  kind: "overview" | "section";
  sourceLabel: string;
  excerpt: string;
  text: string;
  keywords: string[];
}

export interface KBIndex {
  generatedAt: string;
  totalFiles: number;
  totalChunks: number;
  chunks: KBChunk[];
}

