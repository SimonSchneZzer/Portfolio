import { readFile } from "node:fs/promises";
import type { ChatMessage, KBChunk, KBIndex, StreamSource } from "./types.js";

interface LoadedKBChunk extends KBChunk {
  normalizedText: string;
  keywordSet: Set<string>;
}

export interface LoadedKnowledgeBase {
  generatedAt: string;
  totalFiles: number;
  totalChunks: number;
  chunks: LoadedKBChunk[];
}

type RetrievalIntent =
  | "profile"
  | "technical"
  | "projects"
  | "work"
  | "leadership"
  | "languages"
  | "future_direction"
  | "management_direction";

const stopwords = new Set([
  "aber",
  "about",
  "als",
  "and",
  "are",
  "bei",
  "das",
  "dem",
  "den",
  "der",
  "des",
  "die",
  "ein",
  "eine",
  "einer",
  "eines",
  "for",
  "his",
  "ich",
  "im",
  "in",
  "ist",
  "mit",
  "oder",
  "on",
  "the",
  "und",
  "von",
  "was",
  "wie",
  "with",
  "you",
  "your",
  "yourself",
  "zu"
]);

const retrievalExclusions = new Set(["10_portfolio_chatbot_guardrails"]);

const intentDefinitions = {
  profile: {
    patterns: [
      /\b(who is simon|wer ist simon|who are you|wer bist du|tell me about simon|tell me about yourself|introduce simon|introduce yourself|about simon|about yourself|profil|profile|professional summary)\b/i,
      /\b(st(?:a|ä)rken|strengths?|arbeitsweise|work style|collaboration style|zusammenarbeit|professional profile)\b/i
    ],
    phrases: [
      "who is simon",
      "wer ist simon",
      "who are you",
      "wer bist du",
      "tell me about simon",
      "tell me about yourself",
      "introduce simon",
      "introduce yourself",
      "work style",
      "collaboration style",
      "professional profile"
    ],
    fallback: ["01_professional_summary", "09_professional_positioning", "03_technical_background", "07_leadership_and_communication"]
  },
  technical: {
    patterns: [
      /\b(frontend|technical|skills?|stack|react|next(?:\s?js)?|html|css|javascript|ui|ux|interface|design system)\b/i,
      /\b(product thinking|technical background|tech focus|frontend focus)\b/i
    ],
    phrases: ["frontend focus", "technical background", "technical skills", "ui focus", "product thinking"],
    fallback: ["03_technical_background", "06_design_hci_product", "09_professional_positioning"]
  },
  projects: {
    patterns: [/\b(projects?|projekte?|progressa|seek discomfort|thesis|bachelor|lazy loading|lazyloading)\b/i],
    phrases: ["selected projects", "progressa", "seek discomfort", "bachelor thesis", "lazy loading"],
    fallback: ["05_selected_projects", "06_design_hci_product", "01_professional_summary"]
  },
  work: {
    patterns: [
      /\b(experience|work experience|berufserfahrung|internship|intern|praktika|praktikum|worked|environment)\b/i,
      /\b(neke|spar|civilian|kinderschutzzentrum|schischule)\b/i
    ],
    phrases: ["work experience", "internship experience", "neke-neke", "spar ics", "kinderschutzzentrum salzburg"],
    fallback: ["04_work_experience", "07_leadership_and_communication", "11_verified_facts"]
  },
  leadership: {
    patterns: [
      /\b(leadership|communication|mediation|sprecher|spokesperson|representative|class spokesperson)\b/i,
      /\b(designers?|stakeholders?|team environment|team setting|collaboration)\b/i
    ],
    phrases: ["leadership style", "communication strengths", "structured communication", "stakeholder alignment"],
    fallback: ["07_leadership_and_communication", "04_work_experience"]
  },
  languages: {
    patterns: [/\b(languages?|sprachen|german|english|swedish|hungarian)\b/i],
    phrases: ["which languages", "what languages", "languages does simon speak"],
    fallback: ["08_languages_and_interests", "11_verified_facts"]
  },
  future_direction: {
    patterns: [
      /\b(future direction|where is simon heading|where are you heading|heading professionally|what kind of role fits simon|what kind of role fits you)\b/i,
      /\b(berufliche richtung|welche rolle passt|role fit|professional direction)\b/i
    ],
    phrases: ["future direction", "role fits simon", "role fits you", "professional direction", "role fit"],
    fallback: ["09_professional_positioning", "01_professional_summary", "06_design_hci_product"]
  },
  management_direction: {
    patterns: [
      /\b(master|multimediaart|producing|management|teamlead|team lead|scrum master|product owner|project manager|product manager|consultant|consulting)\b/i,
      /\b(projektmanagement|produktmanagement|beratung|teamleitung|fuehrung|führung)\b/i
    ],
    phrases: ["management direction", "producing specialisation", "scrum master", "product owner", "project manager", "consulting"],
    fallback: ["09_professional_positioning", "11_verified_facts", "02_education", "12_verified_academic_details"]
  }
} satisfies Record<RetrievalIntent, { patterns: RegExp[]; phrases: string[]; fallback: string[] }>;

const intentPriority: RetrievalIntent[] = [
  "management_direction",
  "projects",
  "work",
  "leadership",
  "technical",
  "languages",
  "future_direction",
  "profile"
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return normalize(text)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopwords.has(token));
}

function extractUserQueries(messages: ChatMessage[]) {
  return messages.filter((message) => message.role === "user").map((message) => message.content);
}

function detectIntents(text: string) {
  const normalized = normalize(text);
  const intents = new Set<RetrievalIntent>();

  for (const [intent, definition] of Object.entries(intentDefinitions) as Array<[RetrievalIntent, (typeof intentDefinitions)[RetrievalIntent]]>) {
    if (definition.patterns.some((pattern) => pattern.test(normalized))) {
      intents.add(intent);
    }
  }

  return intents;
}

function isIntroQuery(text: string) {
  return /(who is simon|wer ist simon|who are you|wer bist du|tell me about simon|tell me about yourself|introduce simon|introduce yourself|give me an introduction|kurze vorstellung)/i.test(
    normalize(text)
  );
}

function collectMatchedPhrases(query: string, intents: Set<RetrievalIntent>) {
  const normalizedQuery = normalize(query);
  const phrases = new Set<string>();

  for (const intent of intents) {
    for (const phrase of intentDefinitions[intent].phrases) {
      if (normalizedQuery.includes(normalize(phrase))) {
        phrases.add(normalize(phrase));
      }
    }
  }

  return [...phrases];
}

function buildFallbackFileBases(intents: Set<RetrievalIntent>) {
  const fileBases = intentPriority
    .filter((intent) => intents.has(intent))
    .flatMap((intent) => intentDefinitions[intent].fallback);

  const resolvedFileBases = fileBases.length > 0 ? fileBases : intentDefinitions.profile.fallback;
  return [...new Set(resolvedFileBases)];
}

function scoreChunk(
  chunk: LoadedKBChunk,
  latestQuery: string,
  historyQuery: string,
  intents: Set<RetrievalIntent>,
  matchedPhrases: string[]
) {
  const latestNormalized = normalize(latestQuery);
  const historyNormalized = normalize(historyQuery);
  const latestTokens = tokenize(latestQuery);
  const historyTokens = tokenize(historyQuery);
  const sectionNormalized = chunk.section ? normalize(chunk.section) : "";
  const titleNormalized = normalize(chunk.title);
  const fallbackFileBases = buildFallbackFileBases(intents);
  let score = 0;

  for (const token of latestTokens) {
    if (chunk.keywordSet.has(token)) {
      score += 5;
    } else if (chunk.normalizedText.includes(token)) {
      score += 1;
    }
  }

  for (const token of historyTokens) {
    if (chunk.keywordSet.has(token)) {
      score += 2;
    } else if (historyNormalized.includes(token) && chunk.normalizedText.includes(token)) {
      score += 1;
    }
  }

  if (titleNormalized && latestNormalized.includes(titleNormalized)) {
    score += 10;
  }

  if (sectionNormalized && latestNormalized.includes(sectionNormalized)) {
    score += 14;
  }

  for (const phrase of matchedPhrases) {
    if (chunk.normalizedText.includes(phrase)) {
      score += phrase.includes(" ") ? 12 : 4;
    }
  }

  if (fallbackFileBases.includes(chunk.fileBase)) {
    score += 8;
  }

  if (chunk.kind === "overview") {
    score += 1;
  }

  if (chunk.fileBase === "11_verified_facts" && !intents.has("languages") && !intents.has("work")) {
    score -= 2;
  }

  if (chunk.fileBase === "05_selected_projects" && latestNormalized.includes("progressa") && /progressa/i.test(chunk.section ?? "")) {
    score += 10;
  }

  if (chunk.fileBase === "05_selected_projects" && latestNormalized.includes("seek discomfort") && /seek discomfort/i.test(chunk.section ?? "")) {
    score += 10;
  }

  if (chunk.fileBase === "07_leadership_and_communication" && /(leadership|communication|stakeholder|collaboration)/i.test(latestNormalized)) {
    score += 6;
  }

  if (chunk.fileBase === "06_design_hci_product" && /(design|ui|ux|interface|product)/i.test(latestNormalized)) {
    score += 6;
  }

  if (chunk.fileBase === "04_work_experience" && /(internship|experience|environment|neke|spar)/i.test(latestNormalized)) {
    score += 6;
  }

  if (chunk.fileBase === "09_professional_positioning" && /(role|direction|fit|future)/i.test(latestNormalized)) {
    score += 6;
  }

  for (const intent of intents) {
    if (intentDefinitions[intent].fallback.includes(chunk.fileBase)) {
      score += 7;
    }
  }

  return score;
}

function uniqueSources(chunks: LoadedKBChunk[]): StreamSource[] {
  const seen = new Set<string>();

  return chunks
    .map((chunk) => ({
      label: chunk.sourceLabel,
      file: chunk.file,
      section: chunk.section
    }))
    .filter((source) => {
      const key = `${source.file}:${source.section}:${source.label}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function fallbackChunks(index: LoadedKnowledgeBase, limit: number) {
  const fallback = intentDefinitions.profile.fallback
    .flatMap((fileBase) =>
      index.chunks
        .filter((chunk) => chunk.fileBase === fileBase)
        .sort((left, right) => Number(right.kind === "overview") - Number(left.kind === "overview"))
        .slice(0, 1)
    )
    .slice(0, limit);

  return fallback;
}

export async function loadKnowledgeBase(filePath: string): Promise<LoadedKnowledgeBase> {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as KBIndex;

  return {
    generatedAt: parsed.generatedAt,
    totalFiles: parsed.totalFiles,
    totalChunks: parsed.totalChunks,
    chunks: parsed.chunks
      .filter((chunk) => !retrievalExclusions.has(chunk.fileBase))
      .map((chunk) => ({
        ...chunk,
        normalizedText: normalize([chunk.title, chunk.section, chunk.text].filter(Boolean).join(" ")),
        keywordSet: new Set(chunk.keywords.map((keyword) => normalize(keyword)))
      }))
  };
}

export function retrieveRelevantContext(index: LoadedKnowledgeBase, messages: ChatMessage[], maxChunks: number) {
  const userQueries = extractUserQueries(messages);
  const latestUserMessage = userQueries.at(-1) ?? "";
  const historyQuery = userQueries.slice(-3, -1).join(" ");
  const combinedQuery = [latestUserMessage, historyQuery].filter(Boolean).join(" ");
  const intents = detectIntents(combinedQuery);
  const matchedPhrases = collectMatchedPhrases(latestUserMessage, intents);

  if (intents.size === 0 && latestUserMessage) {
    intents.add("profile");
  }

  let ranked = index.chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, latestUserMessage, historyQuery, intents, matchedPhrases)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (isIntroQuery(latestUserMessage)) {
    intents.add("profile");
    ranked = buildFallbackFileBases(intents)
      .flatMap((fileBase) =>
        index.chunks
          .filter((chunk) => chunk.fileBase === fileBase)
          .sort((left, right) => Number(right.kind === "overview") - Number(left.kind === "overview"))
          .slice(0, 1)
      )
      .slice(0, maxChunks)
      .map((chunk, offset) => ({
        chunk,
        score: 100 - offset
      }));
  }

  const selectedChunks = (ranked.length > 0 ? ranked.slice(0, maxChunks).map((entry) => entry.chunk) : fallbackChunks(index, maxChunks))
    .filter(Boolean);

  return {
    chunks: selectedChunks,
    sources: uniqueSources(selectedChunks)
  };
}
