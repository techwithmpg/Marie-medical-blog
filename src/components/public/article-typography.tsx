import React from "react";

interface ProseMirrorMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface ProseMirrorNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ProseMirrorNode[];
  text?: string;
  marks?: ProseMirrorMark[];
}

function getSafeUrl(href: unknown): {
  url: string | null;
  isExternal: boolean;
} {
  if (typeof href !== "string") return { url: null, isExternal: false };
  const trimmed = href.trim();
  if (!trimmed) return { url: null, isExternal: false };

  // Allow single root-relative paths and anchor links, rejecting protocol-relative (//) or (/\)
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\")
  ) {
    return { url: trimmed, isExternal: false };
  }

  if (trimmed.startsWith("#")) {
    return { url: trimmed, isExternal: false };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return { url: trimmed, isExternal: true };
    }
    if (parsed.protocol === "mailto:") {
      return { url: trimmed, isExternal: false };
    }
  } catch {
    return { url: null, isExternal: false };
  }

  return { url: null, isExternal: false };
}

function renderTextWithMarks(
  text: string,
  marks?: ProseMirrorMark[],
  key?: string | number,
): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let element: React.ReactNode = text;

  marks.forEach((mark, markIndex) => {
    const markKey = `${key}-mark-${markIndex}`;
    switch (mark.type) {
      case "bold":
        element = (
          <strong key={markKey} className="font-semibold text-ink">
            {element}
          </strong>
        );
        break;
      case "italic":
        element = (
          <em key={markKey} className="italic">
            {element}
          </em>
        );
        break;
      case "strike":
        element = (
          <s key={markKey} className="text-ink-muted line-through">
            {element}
          </s>
        );
        break;
      case "code":
        element = (
          <code
            key={markKey}
            className="rounded bg-subtle-field px-1.5 py-0.5 font-mono text-sm text-ink"
          >
            {element}
          </code>
        );
        break;
      case "link": {
        const { url, isExternal } = getSafeUrl(mark.attrs?.href);
        if (url) {
          element = (
            <a
              key={markKey}
              href={url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="text-oxide-link underline underline-offset-2 transition-colors hover:text-oxide"
            >
              {element}
            </a>
          );
        }
        break;
      }
      default:
        // Ignore unknown mark, preserve text
        break;
    }
  });

  return element;
}

function renderNode(
  node: ProseMirrorNode,
  key: string | number,
): React.ReactNode {
  if (node.type === "text" && typeof node.text === "string") {
    return renderTextWithMarks(node.text, node.marks, key);
  }

  const children = Array.isArray(node.content)
    ? node.content.map((child, childIndex) =>
        renderNode(child, `${key}-${childIndex}`),
      )
    : null;

  switch (node.type) {
    case "paragraph":
      return (
        <p
          key={key}
          className="mb-6 text-[18px] leading-[1.65] text-ink md:text-[19px]"
        >
          {children}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level) || 2;
      if (level === 2) {
        return (
          <h2
            key={key}
            className="mt-10 mb-4 font-serif text-2xl font-medium tracking-tight text-ink md:text-3xl"
          >
            {children}
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3
            key={key}
            className="mt-8 mb-3 font-serif text-xl font-medium tracking-tight text-ink md:text-2xl"
          >
            {children}
          </h3>
        );
      }
      return (
        <h4
          key={key}
          className="mt-6 mb-2 font-serif text-lg font-medium text-ink"
        >
          {children}
        </h4>
      );
    }
    case "bulletList":
      return (
        <ul
          key={key}
          className="mb-6 list-disc space-y-2 pl-6 text-[18px] leading-[1.65] text-ink md:text-[19px]"
        >
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol
          key={key}
          className="mb-6 list-decimal space-y-2 pl-6 text-[18px] leading-[1.65] text-ink md:text-[19px]"
        >
          {children}
        </ol>
      );
    case "listItem":
      return (
        <li key={key} className="leading-relaxed">
          {children}
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-6 border-l-2 border-oxide pl-5 text-[18px] leading-[1.65] text-ink-muted italic md:text-[19px]"
        >
          {children}
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre
          key={key}
          className="my-6 overflow-x-auto rounded border border-subtle-divider bg-subtle-field p-4 font-mono text-sm text-ink"
        >
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} className="my-10 border-t border-subtle-divider" />;
    case "hardBreak":
      return <br key={key} />;
    case "doc":
      return (
        <div key={key} className="article-body font-sans">
          {children}
        </div>
      );
    default:
      // Unknown container node: safely render children
      return children ? (
        <React.Fragment key={key}>{children}</React.Fragment>
      ) : null;
  }
}

interface ArticleTypographyProps {
  contentJson: unknown;
  className?: string;
}

export function ArticleTypography({
  contentJson,
  className = "",
}: ArticleTypographyProps) {
  if (
    !contentJson ||
    typeof contentJson !== "object" ||
    !("type" in contentJson) ||
    (contentJson as { type: string }).type !== "doc"
  ) {
    return (
      <div className="rounded-lg border border-subtle-divider bg-paper p-6 text-center text-sm text-ink-muted">
        Article content is temporarily unavailable.
      </div>
    );
  }

  return (
    <div className={`article-prose max-w-[720px] ${className}`}>
      {renderNode(contentJson as ProseMirrorNode, "doc-root")}
    </div>
  );
}
