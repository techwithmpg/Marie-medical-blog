interface TiptapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

export interface ArticleOutlineItem {
  id: string;
  label: string;
  number: number;
}

interface ExtractTakeawayOptions {
  allowSyntheticFallback?: boolean;
}

function getNodeText(node: TiptapNode): string {
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isListNode(node: TiptapNode): boolean {
  return node.type === "bulletList" || node.type === "orderedList";
}

function getListItems(node: TiptapNode): string[] {
  if (!isListNode(node)) {
    return [];
  }

  return (node.content ?? [])
    .map((item) => getNodeText(item).trim())
    .filter(Boolean)
    .slice(0, 4);
}

function isTakeawayHeading(value: string): boolean {
  return /^(key\s+takeaways?|takeaways?)$/i.test(value.trim());
}

export function getArticleHeadingId(number: number, label: string): string {
  const suffix = slugify(label) || "section";

  return `section-${String(number).padStart(2, "0")}-${suffix}`;
}

export function extractArticleOutline(
  contentJson: unknown,
): ArticleOutlineItem[] {
  if (
    !contentJson ||
    typeof contentJson !== "object" ||
    !("type" in contentJson) ||
    (contentJson as { type?: unknown }).type !== "doc"
  ) {
    return [];
  }

  const doc = contentJson as TiptapNode;

  if (!Array.isArray(doc.content)) {
    return [];
  }

  const levelTwo = doc.content.filter(
    (node) =>
      node.type === "heading" &&
      Number(node.attrs?.level) === 2 &&
      !isTakeawayHeading(getNodeText(node)),
  );

  const candidates =
    levelTwo.length > 0
      ? levelTwo
      : doc.content.filter(
          (node) =>
            node.type === "heading" &&
            Number(node.attrs?.level) === 3 &&
            !isTakeawayHeading(getNodeText(node)),
        );

  return candidates
    .map((node, index) => {
      const label = getNodeText(node).trim();

      if (!label) {
        return null;
      }

      const number = index + 1;

      return {
        id: getArticleHeadingId(number, label),
        label,
        number,
      };
    })
    .filter((item): item is ArticleOutlineItem => item !== null);
}

export function extractKeyTakeaways(
  contentJson: unknown,
  options: ExtractTakeawayOptions = {},
): string[] {
  if (
    !contentJson ||
    typeof contentJson !== "object" ||
    !("type" in contentJson) ||
    (contentJson as { type?: unknown }).type !== "doc"
  ) {
    return [];
  }

  const doc = contentJson as TiptapNode;

  if (!Array.isArray(doc.content)) {
    return [];
  }

  for (let index = 0; index < doc.content.length; index += 1) {
    const node = doc.content[index];

    if (node.type !== "heading" || !isTakeawayHeading(getNodeText(node))) {
      continue;
    }

    const followingNodes = doc.content.slice(index + 1);

    const listNode = followingNodes.find((candidate) => isListNode(candidate));

    if (listNode) {
      return getListItems(listNode);
    }
  }

  /*
   * Local synthetic-fixture fallback only.
   * This allows the development article to exercise the
   * component without inventing medical claims.
   */
  if (options.allowSyntheticFallback) {
    const syntheticList = doc.content.find((node) => isListNode(node));

    if (syntheticList) {
      return getListItems(syntheticList).slice(0, 3);
    }
  }

  return [];
}
