interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamOptions {
  baseUrl: string;
  model: string;
  messages: OllamaMessage[];
  timeoutMs: number;
  maxTokens: number;
  /** Aborted when the visitor closes the chat, so the model stops working right away. */
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

export async function streamOllamaChat({ baseUrl, model, messages, timeoutMs, maxTokens, signal, onToken }: StreamOptions) {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);
  signal?.addEventListener("abort", () => abortController.abort(), { once: true });

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: abortController.signal,
      body: JSON.stringify({
        model,
        stream: true,
        messages,
        options: { num_predict: maxTokens }
      })
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`Ollama request failed: ${response.status} ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          continue;
        }

        const chunk = JSON.parse(trimmed) as {
          done?: boolean;
          message?: {
            content?: string;
          };
        };

        if (chunk.message?.content) {
          onToken(chunk.message.content);
        }

        if (chunk.done) {
          return;
        }
      }
    }

    const trailingChunk = buffer.trim();

    if (!trailingChunk) {
      return;
    }

    const finalChunk = JSON.parse(trailingChunk) as {
      done?: boolean;
      message?: {
        content?: string;
      };
    };

    if (finalChunk.message?.content) {
      onToken(finalChunk.message.content);
    }
  } finally {
    clearTimeout(timeout);
  }
}
