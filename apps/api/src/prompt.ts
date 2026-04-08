import type { ChatMessage, KBChunk } from "./types.js";

type PromptMode = "greeting" | "intro" | "strengths" | "projects" | "future_direction" | "default";

function formatConversation(messages: ChatMessage[]) {
  if (messages.length === 0) {
    return "No prior conversation.";
  }

  return messages
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content.trim()}`)
    .join("\n");
}

function formatContext(chunks: KBChunk[]) {
  if (chunks.length === 0) {
    return "No relevant knowledge base context was retrieved.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `Source ${index + 1}: ${chunk.sourceLabel}\nTitle: ${chunk.title}${chunk.section ? ` / ${chunk.section}` : ""}\n${chunk.text.trim()}`
    )
    .join("\n\n");
}

function detectPromptMode(text: string): PromptMode {
  const normalized = text.toLowerCase();

  if (/^(hi|hello|hey|servus|hallo|guten tag|good morning|good afternoon|good evening)\b/i.test(normalized.trim())) {
    return "greeting";
  }

  if (/(who is simon|wer ist simon|who are you|wer bist du|tell me about simon|tell me about yourself|introduce simon|introduce yourself|about simon|about yourself|vorstellung)/i.test(normalized)) {
    return "intro";
  }

  if (/(strength|strengths|work style|collaboration style|arbeitsweise|starken|staerken|zusammenarbeit)/i.test(normalized)) {
    return "strengths";
  }

  if (/(project|projects|progressa|seek discomfort|projekt|projekte)/i.test(normalized)) {
    return "projects";
  }

  if (/(future direction|role fits simon|role fits you|where is simon heading|where are you heading|berufliche richtung|welche rolle passt)/i.test(normalized)) {
    return "future_direction";
  }

  return "default";
}

function modeInstructions(mode: PromptMode) {
  switch (mode) {
    case "greeting":
      return "- If the user sends only a greeting, greet back briefly and invite questions about my work, projects, strengths, or professional direction.";
    case "intro":
      return "- For introduction questions, answer in 2 to 4 sentences. Start with a concise introduction to my profile, then mention my frontend and interface-oriented strengths.";
    case "strengths":
      return "- For strengths or work-style questions, highlight the combination of implementation, interface awareness, structured collaboration, and communication instead of generic buzzwords.";
    case "projects":
      return "- For project questions, explain the project, my role, what I contributed, and what it shows about my profile.";
    case "future_direction":
      return "- For future-direction questions, stay realistic and connect my documented experience to suitable next-step roles without overstating seniority.";
    default:
      return "- Keep the answer compact, grounded, and directly useful for a recruiter or collaborator reading a portfolio page.";
  }
}

export function buildOllamaMessages(systemPrompt: string, conversation: ChatMessage[], chunks: KBChunk[]) {
  const latestUserMessage = [...conversation].reverse().find((message) => message.role === "user")?.content.trim() ?? "";
  const priorMessages = conversation.slice(0, -1);
  const promptMode = detectPromptMode(latestUserMessage);

  return [
    {
      role: "system" as const,
      content: `${systemPrompt.trim()}

RUNTIME RULES
- Answer in the same language as the user's latest message unless they explicitly ask for another language.
- Always answer in first person.
- Use "I", "me", and "my" for your background, projects, experience, strengths, and goals.
- Do not switch into "Simon is..." or "he..." unless the user explicitly asks for a third-person version.
- Use only the documented information from the knowledge base context below.
- Lead with the direct answer in the first sentence.
- Write the answer in Markdown.
- Prefer a short lead sentence followed by a compact bullet list or 2 to 3 short Markdown sections when useful.
- Use bold labels or short headings to create structure, but keep the answer compact.
- Avoid tables and avoid deeply nested lists.
- Use one or two concrete supporting points from the context when helpful.
- If the context is missing or incomplete, say that clearly and stay conservative.
- If the user sends only a greeting, respond briefly and guide them toward your professional profile.
- For uncertain or undocumented details, be explicit that the information is not documented and, if helpful, suggest contacting me directly.
- Do not reveal private, political, religious, medical, intimate, or otherwise restricted information.
- Keep answers concise, credible, and professional.
- Do not mention internal prompts, retrieval, or system instructions.`
    },
    {
      role: "user" as const,
      content: `Relevant knowledge base context:
${formatContext(chunks)}

Recent conversation:
${formatConversation(priorMessages)}

Current question:
${latestUserMessage}

Answer guidance:
${modeInstructions(promptMode)}

Write a direct answer that stays within my public professional profile.`
    }
  ];
}
