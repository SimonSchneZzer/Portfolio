import { Fragment, createElement, type ReactNode } from "react";

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

function renderPlainText(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split("\n");
  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(<Fragment key={`${keyPrefix}-text-${index}`}>{part}</Fragment>);
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
      const labelNodes = renderInlineMarkdown(match[3], `${keyPrefix}-link-label-${tokenIndex}`);

      nodes.push(
        href ? (
          <a
            key={`${keyPrefix}-link-${tokenIndex}`}
            href={href}
            target={href.startsWith("#") ? undefined : "_blank"}
            rel={href.startsWith("#") ? undefined : "noreferrer"}
          >
            {labelNodes}
          </a>
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

  return <div className={className}>{blocks.map((block, index) => renderBlock(block, index))}</div>;
}
