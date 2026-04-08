interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamOptions {
  baseUrl: string;
  model: string;
  messages: OllamaMessage[];
  onToken: (token: string) => void;
}

export async function streamOllamaChat({ baseUrl, model, messages, onToken }: StreamOptions) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages
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
}
