export type QueryParamValue = string | string[] | undefined;

export interface DiscoverySearchParams {
  q?: QueryParamValue;
  topic?: QueryParamValue;
  page?: QueryParamValue;
  [key: string]: QueryParamValue;
}

export interface ParsedPageQuery {
  page: number;
  hasPageParam: boolean;
  isMalformed: boolean;
}

export interface PaginationDiscoveryDecision {
  canonicalPath: string;
  index: boolean;
}

interface BlogDiscoveryOptions {
  q: QueryParamValue;
  topic: QueryParamValue;
  page: QueryParamValue;
  totalPages: number;
  canonicalTopicSlug?: string | null;
}

interface TopicDiscoveryOptions {
  basePath: string;
  page: QueryParamValue;
  totalPages: number;
  hasPublishedArticles: boolean;
}

const INTEGER_PATTERN = /^\d+$/;

export function getSingleQueryParam(
  value: QueryParamValue,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function hasQueryParam(value: QueryParamValue): boolean {
  return value !== undefined;
}

export function parsePageQuery(value: QueryParamValue): ParsedPageQuery {
  if (value === undefined) {
    return {
      page: 1,
      hasPageParam: false,
      isMalformed: false,
    };
  }

  if (Array.isArray(value)) {
    return {
      page: 1,
      hasPageParam: true,
      isMalformed: true,
    };
  }

  const normalized = value.trim();

  if (!normalized) {
    return {
      page: 1,
      hasPageParam: true,
      isMalformed: false,
    };
  }

  if (!INTEGER_PATTERN.test(normalized)) {
    return {
      page: 1,
      hasPageParam: true,
      isMalformed: true,
    };
  }

  const parsed = Number(normalized);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return {
      page: 1,
      hasPageParam: true,
      isMalformed: true,
    };
  }

  return {
    page: parsed,
    hasPageParam: true,
    isMalformed: false,
  };
}

export function resolvePaginationDiscovery(
  basePath: string,
  pageState: ParsedPageQuery,
  totalPages: number,
): PaginationDiscoveryDecision {
  if (pageState.isMalformed) {
    return {
      canonicalPath: basePath,
      index: false,
    };
  }

  if (pageState.page <= 1) {
    return {
      canonicalPath: basePath,
      index: true,
    };
  }

  if (totalPages > 0 && pageState.page <= totalPages) {
    return {
      canonicalPath: `${basePath}?page=${pageState.page}`,
      index: true,
    };
  }

  return {
    canonicalPath: basePath,
    index: false,
  };
}

export function resolveBlogDiscovery({
  q,
  topic,
  page,
  totalPages,
  canonicalTopicSlug,
}: BlogDiscoveryOptions): PaginationDiscoveryDecision {
  if (hasQueryParam(q)) {
    return {
      canonicalPath: "/blog",
      index: false,
    };
  }

  if (hasQueryParam(topic)) {
    const requestedTopicSlug = getSingleQueryParam(topic)?.trim();
    const verifiedTopicSlug = canonicalTopicSlug?.trim();

    if (!requestedTopicSlug || !verifiedTopicSlug) {
      return {
        canonicalPath: "/blog",
        index: false,
      };
    }

    return {
      canonicalPath: `/topics/${encodeURIComponent(verifiedTopicSlug)}`,
      index: false,
    };
  }

  return resolvePaginationDiscovery("/blog", parsePageQuery(page), totalPages);
}

export function resolveTopicDiscovery({
  basePath,
  page,
  totalPages,
  hasPublishedArticles,
}: TopicDiscoveryOptions): PaginationDiscoveryDecision {
  if (!hasPublishedArticles) {
    return {
      canonicalPath: basePath,
      index: false,
    };
  }

  return resolvePaginationDiscovery(basePath, parsePageQuery(page), totalPages);
}
