import React from "react";

import { getArticleHeadingId } from "@/lib/article-outline";

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

interface HeadingMeta {
  id: string;
  number: number;
}

function getNodeText(node: ProseMirrorNode): string {
  if (node.type === "text" && typeof node.text === "string") {
    return node.text;
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content
    .map((child) => getNodeText(child))
    .join("")
    .trim();
}

function getSafeUrl(href: unknown): {
  url: string | null;
  isExternal: boolean;
} {
  if (typeof href !== "string") {
    return { url: null, isExternal: false };
  }

  const trimmed = href.trim();

  if (!trimmed) {
    return { url: null, isExternal: false };
  }

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
      return {
        url: trimmed,
        isExternal: true,
      };
    }

    if (parsed.protocol === "mailto:") {
      return {
        url: trimmed,
        isExternal: false,
      };
    }
  } catch {
    return {
      url: null,
      isExternal: false,
    };
  }

  return {
    url: null,
    isExternal: false,
  };
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
        break;
    }
  });

  return element;
}

function renderNode(
  node: ProseMirrorNode,
  key: string | number,
  headingMeta?: HeadingMeta,
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
          className="mb-6 text-[18px] leading-[1.68] text-ink md:text-[19px]"
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
            id={headingMeta?.id}
            className="mt-12 mb-5 grid scroll-mt-28 grid-cols-[auto_24px_minmax(0,1fr)] items-center gap-3 font-serif text-2xl font-medium tracking-tight text-ink md:text-[1.75rem]"
          >
            {headingMeta && (
              <>
                <span aria-hidden="true" className="text-brand-oxide">
                  {String(headingMeta.number).padStart(2, "0")}
                </span>

                <span
                  aria-hidden="true"
                  className="bg-brand-oxide h-px w-full"
                />
              </>
            )}

            <span className={headingMeta ? "" : "col-span-3"}>{children}</span>
          </h2>
        );
      }

      if (level === 3) {
        return (
          <h3
            key={key}
            className="mt-9 mb-3 font-serif text-xl font-medium tracking-tight text-ink md:text-2xl"
          >
            {children}
          </h3>
        );
      }

      return (
        <h4
          key={key}
          className="mt-7 mb-2 font-serif text-lg font-medium text-ink"
        >
          {children}
        </h4>
      );
    }

    case "bulletList":
      return (
        <ul
          key={key}
          className="mb-7 list-disc space-y-3 pl-6 text-[18px] leading-[1.65] text-ink md:text-[19px]"
        >
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={key}
          className="mb-7 list-decimal space-y-3 pl-6 text-[18px] leading-[1.65] text-ink md:text-[19px]"
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
          className="border-brand-oxide text-muted-ink my-7 border-l-2 pl-5 text-[18px] leading-[1.65] italic md:text-[19px]"
        >
          {children}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          className="my-7 overflow-x-auto border border-subtle-divider bg-subtle-field p-4 font-mono text-sm text-ink"
        >
          <code>{children}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={key} className="my-10 border-t border-subtle-divider" />;

    case "hardBreak":
      return <br key={key} />;

    default:
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
      <div className="border border-subtle-divider bg-paper p-6 text-center text-sm text-ink-muted">
        Article content is temporarily unavailable.
      </div>
    );
  }

  const doc = contentJson as ProseMirrorNode;

  const nodes = Array.isArray(doc.content) ? doc.content : [];

  const levelTwoHeadingIndexes = nodes.flatMap((node, index) =>
    node.type === "heading" && Number(node.attrs?.level) === 2 ? [index] : [],
  );

  return (
    <div className={`article-prose w-full ${className}`}>
      {nodes.map((node, index) => {
        const headingPosition = levelTwoHeadingIndexes.indexOf(index);

        const headingNumber = headingPosition >= 0 ? headingPosition + 1 : null;

        const headingMeta: HeadingMeta | undefined =
          headingNumber !== null
            ? {
                number: headingNumber,
                id: getArticleHeadingId(headingNumber, getNodeText(node)),
              }
            : undefined;

        return renderNode(node, `doc-${index}`, headingMeta);
      })}
    </div>
  );
}
