import type { ChatMessage } from "./types.js";

type SupportedLanguage = "de" | "en";

interface LocalizedText {
  de: string;
  en: string;
}

const professionalSignals = [
  "arbeitsweise",
  "ausbildung",
  "background",
  "career",
  "collaboration",
  "communication",
  "designer",
  "design",
  "education",
  "erfahrung",
  "experience",
  "figma",
  "fit",
  "fh salzburg",
  "frontend",
  "future",
  "html",
  "interface",
  "internship",
  "javascript",
  "leadership",
  "mediation",
  "next",
  "portfolio",
  "product",
  "project",
  "projekt",
  "react",
  "role",
  "skill",
  "stakeholder",
  "strength",
  "study",
  "studium",
  "technical",
  "technology",
  "team",
  "ui",
  "ux",
  "web",
  "work",
  "zusammenarbeit"
];

const allowPatterns = [
  /\b(who is simon|wer ist simon|who are you|wer bist du|tell me about simon|tell me about yourself|introduce simon|introduce yourself|about simon|about yourself|stell simon vor|stell dich vor|kurze vorstellung)\b/i,
  /\b(frontend|technical|skills?|tech stack|html|css|javascript|react|next(?:\s?js)?|ui|ux|interface|product thinking)\b/i,
  /\b(st(?:a|ä)rken|strengths?|arbeitsweise|work style|collaboration style|zusammenarbeit|team(?:work)?|stakeholders?|designers?)\b/i,
  /\b(projects?|projekte?|internships?|praktika|experience|erfahrung|work experience|berufserfahrung)\b/i,
  /\b(leadership|communication|mediation|sprecher|spokesperson|representative|leadership style)\b/i,
  /\b(languages?|sprachen|english|german|swedish|hungarian)\b/i,
  /\b(future direction|where is simon heading|where are you heading|what kind of role fits simon|what kind of role fits you|welche rolle passt|welche rolle passt zu dir|berufliche richtung|professional direction)\b/i
];

const blockedPatterns: Array<{
  name: string;
  pattern: RegExp;
  reply: LocalizedText;
}> = [
  {
    name: "political",
    pattern: /\b(politic|political|election|party|government|regierung|partei|wahl)\b/i,
    reply: {
      de: "Ich bleibe hier bewusst bei meinem öffentlichen professionellen Profil und gehe nicht auf politische Themen ein. Gern helfe ich stattdessen bei meiner Ausbildung, meinen Projekten, Skills oder meiner Berufserfahrung.",
      en: "I stay focused here on my public professional profile and do not cover political topics. I can help with my education, projects, skills, or work experience instead."
    }
  },
  {
    name: "religious",
    pattern: /\b(religion|religious|faith|church|god|belief|glaube|kirche)\b/i,
    reply: {
      de: "Religiöse Themen gehören nicht in diesen Portfolio-Kontext. Wenn du möchtest, kann ich dir stattdessen meinen professionellen Hintergrund erklären.",
      en: "Religious topics are outside this portfolio context. If you want, I can answer questions about my professional background instead."
    }
  },
  {
    name: "intimate",
    pattern: /\b(sex|sexual|dating|relationship|girlfriend|boyfriend|partner|intimate|beziehung)\b/i,
    reply: {
      de: "Private Beziehungs- oder intime Themen bespreche ich hier nicht. Dieser Chat ist auf mein professionelles Profil begrenzt.",
      en: "I do not discuss private relationship or intimate topics here. This chat is limited to my professional profile."
    }
  },
  {
    name: "medical",
    pattern: /\b(medical|health issue|diagnosis|therapy|disease|illness|krankheit|medizin)\b/i,
    reply: {
      de: "Medizinische Details gehören nicht in diesen Portfolio-Kontext. Ich kann dir stattdessen bei Ausbildung, Projekten und beruflicher Erfahrung weiterhelfen.",
      en: "Medical details do not belong in this portfolio context. I can help with my education, projects, and professional experience instead."
    }
  },
  {
    name: "sensitive-personal",
    pattern: /\b(date of birth|birthday|age|address|phone number|email address|family|parents|siblings|wohnort|adresse|geburtstag|alter)\b/i,
    reply: {
      de: "Sensible persönliche Details gehören nicht in diesen Portfolio-Chat. Bei öffentlichen professionellen Informationen zu meinem Hintergrund, meinen Projekten und meiner Erfahrung helfe ich dir gern weiter.",
      en: "Sensitive personal details stay out of this portfolio chat. For public professional information, I can help with my background, projects, and experience."
    }
  },
  {
    name: "salary-availability",
    pattern: /\b(salary|compensation|rate|hourly rate|availability|available from|start date|gehalt|verfugbarkeit|verfuegbarkeit)\b/i,
    reply: {
      de: "Zu Gehalt oder Verfügbarkeit sollte ich hier keine Zusagen machen, solange diese Informationen nicht öffentlich dokumentiert sind. Am besten kontaktierst du mich dafür direkt.",
      en: "I should not make salary or availability commitments here unless those details are publicly documented. The safest path for those questions is to contact me directly."
    }
  },
  {
    name: "undocumented",
    pattern: /\b(not in the portfolio|not on the website|not documented|undocumented|nicht im portfolio|nicht dokumentiert)\b/i,
    reply: {
      de: "Wenn etwas nicht in meinem öffentlichen Portfolio dokumentiert ist, sollte ich es nicht erfinden. Ich kann dir gern bei den belegten Informationen weiterhelfen.",
      en: "If something is not documented in my public portfolio, I should not invent it. I can help with the documented information instead."
    }
  }
];

const genericOutOfScopeReply: LocalizedText = {
  de: "Dieser Chat ist auf mein professionelles Profil begrenzt. Ich kann dir bei meiner Ausbildung, meinen technischen Stärken, Projekten, Berufserfahrung, Leadership oder meiner professionellen Ausrichtung helfen.",
  en: "This chat is limited to my professional profile. I can help with my education, technical strengths, projects, work experience, leadership background, or professional direction."
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguage(text: string): SupportedLanguage {
  const normalized = normalize(text);
  const germanSignals =
    /\b(wer|wie|was|welche|welcher|wieso|warum|beruflich|projekt|projekte|ausbildung|erfahrung|praktika|arbeitsweise|zusammenarbeit|starken|staerken|sprachen|gehalt|verfugbarkeit|verfuegbarkeit|hallo|servus)\b/i;

  return germanSignals.test(normalized) ? "de" : "en";
}

function localize(text: LocalizedText, language: SupportedLanguage) {
  return language === "de" ? text.de : text.en;
}

function looksLikeGreeting(text: string) {
  return /^(hi|hello|hey|servus|hallo|guten tag|good morning|good afternoon|good evening)\b/i.test(text.trim());
}

export function assessConversationScope(messages: ChatMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const normalized = normalize(latestUserMessage);
  const language = detectLanguage(latestUserMessage);

  for (const rule of blockedPatterns) {
    if (rule.pattern.test(normalized)) {
      return {
        blocked: true,
        reply: localize(rule.reply, language)
      };
    }
  }

  if (looksLikeGreeting(normalized)) {
    return {
      blocked: false
    };
  }

  if (allowPatterns.some((pattern) => pattern.test(normalized))) {
    return {
      blocked: false
    };
  }

  const hasProfessionalSignal = professionalSignals.some((signal) => normalized.includes(signal));

  if (!hasProfessionalSignal) {
    return {
      blocked: true,
      reply: localize(genericOutOfScopeReply, language)
    };
  }

  return {
    blocked: false
  };
}
