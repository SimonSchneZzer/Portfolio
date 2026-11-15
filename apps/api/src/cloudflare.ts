interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamOptions {
  accountId: string;
  apiToken: string;
  model: string;
  messages: ChatCompletionMessage[];
  maxTokens: number;
  timeoutMs: number;
  onToken: (token: string) => void;
}

interface CompletionChunk {
  choices?: Array<{ delta?: { content?: string | null } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; neurons?: number };
}

export interface CloudflareUsage {
  promptTokens?: number;
  completionTokens?: number;
  neurons?: number;
}

/**
 * Streams a chat completion from Cloudflare Workers AI (OpenAI-compatible endpoint).
 * Thinking is disabled so the model answers directly and spends the free neuron budget on the answer only.
 */
export async function streamCloudflareChat({
  accountId,
  apiToken,
  model,
  messages,
  maxTokens,
  timeoutMs,
  onToken
}: StreamOptions): Promise<CloudflareUsage> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);
  let usage: CloudflareUsage = {};

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      signal: abortController.signal,
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: maxTokens,
        temperature: 0.3,
        chat_template_kwargs: { enable_thinking: false }
      })
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`Cloudflare Workers AI request failed: ${response.status} ${errorText.slice(0, 500)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const handleLine = (line: string) => {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) {
        return false;
      }

      const data = trimmed.slice(5).trim();

      if (data === "[DONE]") {
        return true;
      }

      const chunk = JSON.parse(data) as CompletionChunk;
      const token = chunk.choices?.[0]?.delta?.content;

      if (token) {
        onToken(token);
      }

      // Workers AI reports usage per chunk (incremental), so it is summed up.
      if (chunk.usage) {
        usage = {
          promptTokens: (usage.promptTokens ?? 0) + (chunk.usage.prompt_tokens ?? 0),
          completionTokens: (usage.completionTokens ?? 0) + (chunk.usage.completion_tokens ?? 0),
          neurons: Math.round(((usage.neurons ?? 0) + (chunk.usage.neurons ?? 0)) * 100) / 100
        };
      }

      return false;
    };

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (handleLine(line)) {
          return usage;
        }
      }
    }

    handleLine(buffer);
    return usage;
  } finally {
    clearTimeout(timeout);
  }
}
