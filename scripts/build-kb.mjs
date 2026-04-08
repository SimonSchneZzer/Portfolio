import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const knowledgeDir = path.join(repoRoot, "knowledge", "public");
const outputDir = path.join(repoRoot, "data");
const outputFile = path.join(outputDir, "kb-index.json");

const stopwords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "auf",
  "aus",
  "bei",
  "but",
  "by",
  "das",
  "der",
  "die",
  "ein",
  "eine",
  "einer",
  "eines",
  "er",
  "for",
  "from",
  "his",
  "im",
  "in",
  "is",
  "it",
  "mit",
  "of",
  "on",
  "or",
  "the",
  "to",
  "und",
  "wie",
  "with",
  "zu"
]);

const fileLabels = {
  "01_professional_summary": "Based on Simon's professional summary",
  "02_education": "Based on Simon's education background",
  "03_technical_background": "Based on Simon's technical background",
  "04_work_experience": "Based on Simon's work and internship experience",
  "05_selected_projects": "Based on Simon's selected projects",
  "06_design_hci_product": "Based on Simon's design and product profile",
  "07_leadership_and_communication": "Based on Simon's leadership and communication background",
  "08_languages_and_interests": "Based on Simon's languages and interests",
  "09_professional_positioning": "Based on Simon's professional positioning",
  "10_portfolio_chatbot_guardrails": "Based on the chatbot guardrails",
  "11_verified_facts": "Based on Simon's verified public facts"
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopwords.has(token));
}

function createSourceLabel(fileBase, section) {
  if (fileBase === "04_work_experience" && section) {
    if (/neke-neke/i.test(section)) {
      return "Based on internship experience at neke-neke";
    }

    if (/spar ics/i.test(section)) {
      return "Based on internship experience at SPAR ICS";
    }

    if (/kinderschutzzentrum/i.test(section)) {
      return "Based on civilian service at Kinderschutzzentrum Salzburg";
    }

    if (/schischule lech/i.test(section)) {
      return "Based on experience as a children's ski instructor";
    }
  }

  if (fileBase === "05_selected_projects" && section) {
    return `Based on the ${section} project`;
  }

  return fileLabels[fileBase] ?? "Based on Simon's public portfolio materials";
}

function sanitizeMarkdown(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => !/^- Date of birth:/i.test(line.trim()))
    .join("\n")
    .trim();
}

function parseMarkdownSections(content) {
  const lines = content.split(/\r?\n/);
  let title = "";
  const intro = [];
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    if (!title && line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }

    if (line.startsWith("## ")) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        heading: line.slice(3).trim(),
        lines: []
      };

      continue;
    }

    if (currentSection) {
      currentSection.lines.push(line);
    } else {
      intro.push(line);
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    title,
    intro: intro.join("\n").trim(),
    sections: sections
      .map((section) => ({
        heading: section.heading,
        body: section.lines.join("\n").trim()
      }))
      .filter((section) => section.body.length > 0)
  };
}

function makeChunk({ file, fileBase, title, section, text, kind }) {
  const keywords = Array.from(new Set(tokenize([title, section, text].filter(Boolean).join(" ")))).slice(0, 40);
  const sourceLabel = createSourceLabel(fileBase, section);

  return {
    id: `${fileBase}:${kind}:${section ?? "overview"}`.toLowerCase().replace(/\s+/g, "-"),
    file,
    fileBase,
    title,
    section: section ?? null,
    kind,
    sourceLabel,
    excerpt: text.replace(/\s+/g, " ").trim().slice(0, 220),
    text,
    keywords
  };
}

async function buildKnowledgeBaseIndex() {
  const files = (await readdir(knowledgeDir))
    .filter((entry) => entry.endsWith(".md"))
    .sort((left, right) => left.localeCompare(right));

  const chunks = [];

  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const fileBase = file.replace(/\.md$/, "");
    const raw = await readFile(filePath, "utf8");
    const sanitized = sanitizeMarkdown(raw);
    const parsed = parseMarkdownSections(sanitized);

    if (parsed.intro) {
      chunks.push(
        makeChunk({
          file,
          fileBase,
          title: parsed.title,
          text: parsed.intro,
          kind: "overview"
        })
      );
    }

    for (const section of parsed.sections) {
      chunks.push(
        makeChunk({
          file,
          fileBase,
          title: parsed.title,
          section: section.heading,
          text: section.body,
          kind: "section"
        })
      );
    }
  }

  const index = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalChunks: chunks.length,
    chunks
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  console.log(`KB index written to ${outputFile}`);
  console.log(`Files: ${index.totalFiles}`);
  console.log(`Chunks: ${index.totalChunks}`);
}

buildKnowledgeBaseIndex().catch((error) => {
  console.error("Failed to build KB index");
  console.error(error);
  process.exitCode = 1;
});

