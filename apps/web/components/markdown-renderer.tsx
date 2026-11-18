import { Fragment, createElement, type ReactNode } from "react";
import { chatLinkTerms } from "@/content/chat-links";

type MarkdownBlock =
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "unordered-list";
      items: string[];
    }
  | {
      type: "ordered-list";
      items: string[];
    }
  | {
      type: "blockquote";
      text: string;
    }
  | {
      type: "code";
      language: string | null;
      code: string;
    };

function isBlockStart(line: string) {
  return /^(#{1,6})\s+/.test(line) || /^```/.test(line) || /^>\s?/.test(line) || /^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line);
}

function parseBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    if (!line.trim()) {
      lineIndex += 1;
      continue;
    }

    const fencedCodeMatch = line.match(/^```([\w-]+)?\s*$/);

    if (fencedCodeMatch) {
      const language = fencedCodeMatch[1] ?? null;
      const codeLines: string[] = [];
      lineIndex += 1;

      while (lineIndex < lines.length && !/^```/.test(lines[lineIndex])) {
        codeLines.push(lines[lineIndex]);
        lineIndex += 1;
      }

      if (lineIndex < lines.length) {
        lineIndex += 1;
      }

      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n")
      });
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: headingMatch[2].trim()
      });
      lineIndex += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];

      while (lineIndex < lines.length && /^>\s?/.test(lines[lineIndex])) {
        quoteLines.push(lines[lineIndex].replace(/^>\s?/, ""));
        lineIndex += 1;
      }

      blocks.push({
        type: "blockquote",
        text: quoteLines.join("\n")
      });
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];

      while (lineIndex < lines.length && /^[-*+]\s+/.test(lines[lineIndex])) {
        items.push(lines[lineIndex].replace(/^[-*+]\s+/, "").trim());
        lineIndex += 1;
      }

      blocks.push({
        type: "unordered-list",
        items
      });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (lineIndex < lines.length && /^\d+\.\s+/.test(lines[lineIndex])) {
        items.push(lines[lineIndex].replace(/^\d+\.\s+/, "").trim());
        lineIndex += 1;
      }

      blocks.push({
        type: "ordered-list",
        items
      });
      continue;
    }

    const paragraphLines: string[] = [];

    while (lineIndex < lines.length && lines[lineIndex].trim() && !isBlockStart(lines[lineIndex])) {
      paragraphLines.push(lines[lineIndex].trim());
      lineIndex += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ")
    });
  }

  return blocks;
}

function sanitizeHref(href: string) {
  if (href.startsWith("#")) {
    return href;
  }

  try {
    const url = new URL(href, "https://example.com");

    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return href;
    }
  } catch {
    return null;
  }

  return null;
}

// Auto-linking (chat answers): bare URLs, simon.schnetzer.at addresses and known terms (projects, CV, technologies).
// Each term is linked only on its first mention per answer; nothing is linked inside an existing link.
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const termHref = new Map(chatLinkTerms.map(({ term, href }) => [term.toLowerCase(), href]));
const autoLinkPattern = new RegExp(
  [
    String.raw`https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"]`,
    String.raw`(?<![\w@/.])simon\.schnetzer\.at(?:\/[^\s<>()]*[^\s<>().,;:!?'"])?`,
    `(?<![\\w.-])(?:${[...chatLinkTerms].sort((a, b) => b.term.length - a.term.length).map(({ term }) => escapeRegExp(term)).join("|")})(?![\\w-])`
  ].join("|"),
  "g"
);
// Set while one answer renders (rendering is synchronous): which terms are already linked, and whether we are inside a link.
let renderState: { linked: Set<string>; insideLink: number } | null = null;

function renderWords(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Words stay together (no line break inside a word), and every letter gets its own span so newly
  // revealed letters can float in. Keys are positional, so they stay stable while the text grows.
  text.split(/(\s+)/).forEach((piece, pieceIndex) => {
    if (!piece) {
      return;
    }

    const key = `${keyPrefix}-text-${pieceIndex}`;

    nodes.push(
      /^\s+$/.test(piece) ? (
        <Fragment key={key}>{piece}</Fragment>
      ) : (
        <span key={key} className="md-word">
          {Array.from(piece).map((character, characterIndex) => (
            <span key={characterIndex} className="md-char">
              {character}
            </span>
          ))}
        </span>
      )
    );
  });
  return nodes;
}

function linkFor(match: string): string | null {
  if (/^https?:\/\//i.test(match)) {
    return sanitizeHref(match);
  }
  if (/^simon\.schnetzer\.at/i.test(match)) {
    return sanitizeHref(`https://${match}`);
  }
  const key = match.toLowerCase();
  if (!renderState || renderState.linked.has(key)) {
    return null;
  }
  renderState.linked.add(key);
  return termHref.get(key) ?? null;
}

function renderAutoLinked(text: string, keyPrefix: string): ReactNode[] {
  if (!renderState || renderState.insideLink > 0) {
    return renderWords(text, keyPrefix);
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let index = 0;

  for (const match of text.matchAll(autoLinkPattern)) {
    const start = match.index ?? 0;
    const href = linkFor(match[0]);

    if (!href) {
      continue;
    }

    if (start > lastIndex) {
      nodes.push(...renderWords(text.slice(lastIndex, start), `${keyPrefix}-${index}-pre`));
    }

    const external = !href.startsWith("/") && !href.startsWith("#");
    const end = start + match[0].length;
    const punct = text.slice(end).match(/^[.,;:!?)\]]+/)?.[0] ?? "";
    nodes.push(
      keepWithPunct(
        <a key={`${keyPrefix}-${index}-auto`} href={href} target="_blank" rel={external ? "noreferrer" : undefined}>
          {renderWords(match[0], `${keyPrefix}-${index}-label`)}
        </a>,
        punct,
        `${keyPrefix}-${index}`
      )
    );
    lastIndex = end + punct.length;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(...renderWords(text.slice(lastIndex), `${keyPrefix}-${index}-tail`));
  }

  return nodes;
}

/** A link and the punctuation right after it stay on one line (otherwise "Next.js" and "." can wrap apart). */
function keepWithPunct(link: ReactNode, punct: string, key: string): ReactNode {
  if (!punct) {
    return link;
  }
  return (
    <span key={`${key}-keep`} className="md-keep">
      {link}
      {renderWords(punct, `${key}-punct`)}
    </span>
  );
}

function renderPlainText(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split("\n");
  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(...renderAutoLinked(part, `${keyPrefix}-${index}`));
    }

    if (index < parts.length - 1) {
      nodes.push(<br key={`${keyPrefix}-break-${index}`} />);
    }
  });

  return nodes;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const tokenPattern =
    /(`[^`\n]+`)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*\n]+)\*)|(_([^_\n]+)_)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let tokenIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...renderPlainText(text.slice(lastIndex, match.index), `${keyPrefix}-plain-${tokenIndex}`));
    }

    if (match[1]) {
      nodes.push(
        <code key={`${keyPrefix}-code-${tokenIndex}`} className="markdown-inline-code">
          {match[1].slice(1, -1)}
        </code>
      );
    } else if (match[2]) {
      const href = sanitizeHref(match[4]);
      // The model linked it itself: count the label as linked, and never nest links
      renderState?.linked.add(match[3].replace(/[*_`]/g, "").trim().toLowerCase());
      if (renderState) renderState.insideLink += 1;
      const labelNodes = renderInlineMarkdown(match[3], `${keyPrefix}-link-label-${tokenIndex}`);
      if (renderState) renderState.insideLink -= 1;

      const punct = href ? (text.slice(tokenPattern.lastIndex).match(/^[.,;:!?)\]]+/)?.[0] ?? "") : "";
      tokenPattern.lastIndex += punct.length;
      nodes.push(
        href ? (
          keepWithPunct(
            <a
              key={`${keyPrefix}-link-${tokenIndex}`}
              href={href}
              target={href.startsWith("#") ? undefined : "_blank"}
              rel={href.startsWith("#") ? undefined : "noreferrer"}
            >
              {labelNodes}
            </a>,
            punct,
            `${keyPrefix}-link-${tokenIndex}`
          )
        ) : (
          <Fragment key={`${keyPrefix}-link-fallback-${tokenIndex}`}>{labelNodes}</Fragment>
        )
      );
    } else if (match[5]) {
      nodes.push(<strong key={`${keyPrefix}-strong-${tokenIndex}`}>{renderInlineMarkdown(match[6], `${keyPrefix}-strong-inner-${tokenIndex}`)}</strong>);
    } else if (match[7]) {
      nodes.push(<strong key={`${keyPrefix}-strong-alt-${tokenIndex}`}>{renderInlineMarkdown(match[8], `${keyPrefix}-strong-alt-inner-${tokenIndex}`)}</strong>);
    } else if (match[9]) {
      nodes.push(<em key={`${keyPrefix}-em-${tokenIndex}`}>{renderInlineMarkdown(match[10], `${keyPrefix}-em-inner-${tokenIndex}`)}</em>);
    } else if (match[11]) {
      nodes.push(<em key={`${keyPrefix}-em-alt-${tokenIndex}`}>{renderInlineMarkdown(match[12], `${keyPrefix}-em-alt-inner-${tokenIndex}`)}</em>);
    }

    lastIndex = tokenPattern.lastIndex;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(...renderPlainText(text.slice(lastIndex), `${keyPrefix}-tail`));
  }

  return nodes;
}

function renderBlock(block: MarkdownBlock, index: number) {
  switch (block.type) {
    case "heading":
      return createElement(
        `h${block.level}`,
        { key: `heading-${index}` },
        renderInlineMarkdown(block.text, `heading-${index}`)
      );
    case "paragraph":
      return <p key={`paragraph-${index}`}>{renderInlineMarkdown(block.text, `paragraph-${index}`)}</p>;
    case "unordered-list":
      return (
        <ul key={`unordered-list-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`unordered-list-${index}-item-${itemIndex}`}>{renderInlineMarkdown(item, `unordered-list-${index}-item-${itemIndex}`)}</li>
          ))}
        </ul>
      );
    case "ordered-list":
      return (
        <ol key={`ordered-list-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`ordered-list-${index}-item-${itemIndex}`}>{renderInlineMarkdown(item, `ordered-list-${index}-item-${itemIndex}`)}</li>
          ))}
        </ol>
      );
    case "blockquote":
      return <blockquote key={`blockquote-${index}`}>{renderInlineMarkdown(block.text, `blockquote-${index}`)}</blockquote>;
    case "code":
      return (
        <pre key={`code-${index}`}>
          <code className={block.language ? `language-${block.language}` : undefined}>{block.code}</code>
        </pre>
      );
  }
}

export function MarkdownRenderer({ markdown, className }: { markdown: string; className?: string }) {
  const blocks = parseBlocks(markdown);
  renderState = { linked: new Set(), insideLink: 0 };

  try {
    return <div className={className}>{blocks.map((block, index) => renderBlock(block, index))}</div>;
  } finally {
    renderState = null;
  }
}
