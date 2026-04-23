"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

type Role = "user" | "assistant";

interface SourceContext {
  label: string;
  file: string;
  section: string | null;
}

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  sources?: SourceContext[];
}

interface StarterPrompt {
  label: string;
  prompt: string;
}

type StreamEvent =
  | {
      type: "sources";
      sources: SourceContext[];
    }
  | {
      type: "token";
      token: string;
    }
  | {
      type: "done";
    }
  | {
      type: "error";
      message: string;
    };

const starterPrompts: StarterPrompt[] = [
  {
    label: "What strengths do you bring to a product team?",
    prompt: "What strengths do you bring to a product team?"
  },
  {
    label: "Which projects best show your business impact?",
    prompt: "Which projects best show your business impact?"
  },
  {
    label: "How do you work with designers, PMs, and stakeholders?",
    prompt: "How do you work with designers, PMs, and stakeholders?"
  },
  {
    label: "What level of ownership do you take in a team?",
    prompt: "What level of ownership do you take in a team?"
  }
];

const defaultPlaceholder = "Ask what I could bring to your team.";
const animatedPlaceholderPrompts = [
  "What strengths do you bring to our team?",
  "Which projects best show your impact?",
  "How do you work with designers and PMs?"
];
const thinkingPhrases = [
  { label: "Thinking", durationMs: 1700 },
  { label: "Reviewing context", durationMs: 2300 },
  { label: "Looking through my background", durationMs: 2900 },
  { label: "Connecting relevant details", durationMs: 2050 },
  { label: "Checking my project experience", durationMs: 2550 },
  { label: "Matching my strengths to your question", durationMs: 3200 },
  { label: "Pulling together a clear answer", durationMs: 2450 },
  { label: "Drafting the reply", durationMs: 1900 }
];
const thinkingLabelTransitionMs = 360;
const assistantRevealTickMs = 18;

const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "/api/chat";

function invalidStreamError() {
  return new Error("The chat response stream was not valid NDJSON. Please try again.");
}

function parseStreamEvent(line: string): StreamEvent {
  let parsed: unknown;

  try {
    parsed = JSON.parse(line);
  } catch {
    throw invalidStreamError();
  }

  if (!parsed || typeof parsed !== "object") {
    throw invalidStreamError();
  }

  const event = parsed as {
    type?: unknown;
    sources?: unknown;
    token?: unknown;
    message?: unknown;
  };

  if (event.type === "sources" && Array.isArray(event.sources)) {
    return {
      type: "sources",
      sources: event.sources as SourceContext[]
    };
  }

  if (event.type === "token" && typeof event.token === "string") {
    return {
      type: "token",
      token: event.token
    };
  }

  if (event.type === "done") {
    return {
      type: "done"
    };
  }

  if (event.type === "error" && typeof event.message === "string") {
    return {
      type: "error",
      message: event.message
    };
  }

  throw invalidStreamError();
}

function createMessage(role: Role, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content
  };
}

function ThinkingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [outgoingPhrase, setOutgoingPhrase] = useState<string | null>(null);

  useEffect(() => {
    let cleanupTimer: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setOutgoingPhrase(thinkingPhrases[phraseIndex].label);
      setPhraseIndex((current) => (current + 1) % thinkingPhrases.length);
      cleanupTimer = window.setTimeout(() => {
        setOutgoingPhrase(null);
      }, thinkingLabelTransitionMs);
    }, thinkingPhrases[phraseIndex].durationMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (cleanupTimer) {
        window.clearTimeout(cleanupTimer);
      }
    };
  }, [phraseIndex]);

  return (
    <span className="thinking-indicator" role="status" aria-label="Preparing response">
      <span className="thinking-label-stack">
        {outgoingPhrase ? <span className="thinking-label thinking-label-outgoing">{outgoingPhrase}</span> : null}
        <span key={phraseIndex} className="thinking-label thinking-label-current">
          {thinkingPhrases[phraseIndex].label}
        </span>
      </span>
      <span className="thinking-dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </span>
  );
}

function AnimatedAssistantMarkdown({ text }: { text: string }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!text) {
      setVisibleCount(0);
      return;
    }

    setVisibleCount((current) => {
      if (text.length < current) {
        return text.length;
      }

      return current;
    });

    if (visibleCount >= text.length) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setVisibleCount((current) => {
        if (current >= text.length) {
          window.clearInterval(intervalId);
          return current;
        }

        const remaining = text.length - current;
        const step = remaining > 24 ? 3 : remaining > 10 ? 2 : 1;
        return Math.min(current + step, text.length);
      });
    }, assistantRevealTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [text, visibleCount]);

  return (
    <MarkdownRenderer markdown={text.slice(0, visibleCount)} className="assistant-markdown" />
  );
}

function InputPromptOverlay({
  text,
  visibleCount,
  animateCharacters
}: {
  text: string;
  visibleCount: number;
  animateCharacters: boolean;
}) {
  if (!text) {
    return null;
  }

  return (
    <span className="chat-input-overlay" aria-hidden="true">
      {animateCharacters ? (
        Array.from(text).map((character, index) => (
          <span
            key={`${index}-${character}`}
            className={`chat-input-overlay-char${index < visibleCount ? " is-visible" : ""}`}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        ))
      ) : (
        text
      )}
    </span>
  );
}

export function ChatShell({
  onToggleCollapse,
  showCloseButton = false
}: {
  onToggleCollapse: () => void;
  showCloseButton?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(defaultPlaceholder);
  const [animatedPlaceholderVisibleCount, setAnimatedPlaceholderVisibleCount] = useState(defaultPlaceholder.length);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const node = messagesRef.current;

    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    const node = inputRef.current;

    if (!node) {
      return;
    }

    node.style.height = "0px";
    node.style.height = `${Math.max(Math.min(node.scrollHeight, 160), 56)}px`;
  }, [draft]);

  useEffect(() => {
    if (draft || isStreaming) {
      setAnimatedPlaceholder(defaultPlaceholder);
      setAnimatedPlaceholderVisibleCount(defaultPlaceholder.length);
      return;
    }

    let promptIndex = 0;
    let characterCount = 0;
    let isDeleting = false;
    let timeoutId: number | undefined;

    setAnimatedPlaceholder(animatedPlaceholderPrompts[promptIndex]);
    setAnimatedPlaceholderVisibleCount(0);

    const tick = () => {
      const prompt = animatedPlaceholderPrompts[promptIndex];
      setAnimatedPlaceholder(prompt);

      if (!isDeleting) {
        characterCount += 1;
        setAnimatedPlaceholderVisibleCount(characterCount);

        if (characterCount === prompt.length) {
          timeoutId = window.setTimeout(() => {
            isDeleting = true;
            tick();
          }, 1850);

          return;
        }

        timeoutId = window.setTimeout(tick, 78);
        return;
      }

      characterCount -= 1;
      setAnimatedPlaceholderVisibleCount(Math.max(characterCount, 0));

      if (characterCount === 0) {
        promptIndex = (promptIndex + 1) % animatedPlaceholderPrompts.length;
        isDeleting = false;
        timeoutId = window.setTimeout(tick, 340);
        return;
      }

      timeoutId = window.setTimeout(tick, 36);
    };

    timeoutId = window.setTimeout(tick, 360);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [draft, isStreaming]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function runChat(messageText: string) {
    const trimmed = messageText.trim();

    if (!trimmed || isStreaming) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("assistant", "");
    const outboundMessages = messages
      .map((message) => ({
        role: message.role,
        content: message.content
      }))
      .concat({
        role: userMessage.role,
        content: userMessage.content
      });

    setDraft("");
    setError(null);
    setIsStreaming(true);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let didReceiveToken = false;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: outboundMessages
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("The backend did not return a readable stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamCompleted = false;

      const handleEvent = (event: StreamEvent) => {
        if (event.type === "sources") {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    sources: event.sources
                  }
                : message
            )
          );

          return false;
        }

        if (event.type === "token") {
          didReceiveToken = true;
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: `${message.content}${event.token}`
                  }
                : message
            )
          );

          return false;
        }

        if (event.type === "error") {
          throw new Error(event.message);
        }

        return event.type === "done";
      };

      const processLine = (line: string) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return false;
        }

        return handleEvent(parseStreamEvent(trimmedLine));
      };

      try {
        while (!streamCompleted) {
          const { done, value } = await reader.read();

          if (done) {
            buffer += decoder.decode();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (processLine(line)) {
              streamCompleted = true;
              break;
            }
          }
        }

        if (!streamCompleted && processLine(buffer)) {
          streamCompleted = true;
        }
      } finally {
        reader.releaseLock();
      }
    } catch (chatError) {
      if (chatError instanceof DOMException && chatError.name === "AbortError") {
        setMessages((current) =>
          current.filter((entry) => (entry.id === assistantMessage.id ? didReceiveToken : true))
        );
        return;
      }

      const message = chatError instanceof Error ? chatError.message : "The request failed.";

      setError(message);
      setMessages((current) =>
        current.map((entry) =>
          entry.id === assistantMessage.id
            ? {
                ...entry,
                content: "The chat ran into a problem while preparing the reply. Please try again."
              }
            : entry
        )
      );
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }

      setIsStreaming(false);
    }
  }

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runChat(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void runChat(draft);
    }
  }

  return (
    <section className="surface chat-panel">
      <header className="chat-panel-header">
        <div className="chat-panel-header-top">
          <button
            type="button"
            className="chat-heading"
            onClick={onToggleCollapse}
            aria-label="Collapse chat"
            aria-expanded="true"
          >
            <div className="chat-avatar-button">
              <div className="avatar-surface" aria-hidden="true" />
              <span className="avatar-collapse-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="4" x2="13" y2="10" />
                  <line x1="13" y1="10" x2="7" y2="16" />
                </svg>
              </span>
            </div>

            <div>
              <p className="section-kicker">Ask me directly</p>
              <h2>Ask about my work, projects, strengths, and professional direction.</h2>
            </div>
          </button>

          {showCloseButton ? (
            <button
              type="button"
              className="chat-modal-close"
              onClick={onToggleCollapse}
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </button>
          ) : null}
        </div>
      </header>

      <div ref={messagesRef} className="chat-messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="starter-stack" aria-label="Starter prompts">
              {starterPrompts.map((starter) => (
                <button key={starter.label} type="button" className="starter-chip" onClick={() => void runChat(starter.prompt)}>
                  <span className="starter-chip-label">{starter.label}</span>
                  <span className="starter-chip-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="8" x2="13" y2="8" />
                      <polyline points="9,4 13,8 9,12" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`chat-message ${message.role}`}>
              <div className="message-card">
                <div className="message-body">
                  {message.content ? (
                    message.role === "assistant" ? (
                      <AnimatedAssistantMarkdown text={message.content} />
                    ) : (
                      <>{message.content}</>
                    )
                  ) : isStreaming && message.role === "assistant" ? (
                    <ThinkingIndicator />
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="chat-footer">
        <form className="chat-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="chat-input">
            Ask about my professional profile
          </label>

          <div className="chat-input-row">
            <div className="chat-input-wrap">
              {!draft ? (
                <InputPromptOverlay
                  text={animatedPlaceholder}
                  visibleCount={animatedPlaceholderVisibleCount}
                  animateCharacters={!isStreaming}
                />
              ) : null}

              <textarea
                ref={inputRef}
                id="chat-input"
                name="chat-input"
                className="chat-input"
                placeholder=""
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isStreaming}
              />
            </div>

            {isStreaming ? (
              <button type="button" className="chat-submit chat-submit-stop" onClick={handleStop} aria-label="Stop">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="10" height="10" rx="2" />
                </svg>
              </button>
            ) : (
              <button type="submit" className="chat-submit" disabled={!draft.trim()} aria-label="Send">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="8" x2="13" y2="8" />
                  <polyline points="9,4 13,8 9,12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {error ? <p className="error-banner">{error}</p> : null}
      </div>

      <div className="chat-panel-pill-preview" aria-hidden="true">
        <span className="avatar-surface chat-pill-avatar" />
        <span className="chat-pill-label">Chat with me</span>
      </div>
    </section>
  );
}
