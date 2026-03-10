/**
 * Feed selectors - centralized filtering & search logic.
 * Separates UI from data selection for clean architecture.
 */
import type { FeedPost } from './types';
import type { FeedFilters } from './FeedSearch';

export const TRENDING_TAGS = ['#skincare', '#minimal', '#glow', '#aesthetic', '#hair', '#makeup'] as const;
export const CATEGORIES = ['skincare', 'hair', 'nails', 'makeup', 'wellness'] as const;

/** Get filtered posts based on search, filters, and tab */
export function getFilteredPosts(
  posts: FeedPost[],
  searchQuery: string,
  filters: FeedFilters,
  tabFilter: (p: FeedPost) => boolean
): FeedPost[] {
  const query = searchQuery.toLowerCase().trim();

  let filtered = posts.filter((p) => {
    if (!tabFilter(p)) return false;

    const matchesSearch =
      !query ||
      (p.caption || '').toLowerCase().includes(query) ||
      (p.userName || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (filters.categories.length > 0) {
      if (!p.category || !filters.categories.includes(p.category)) return false;
    }

    if (filters.contentType === 'before-after') {
      const isBeforeAfter =
        (p.caption || '').toLowerCase().includes('before') ||
        (p.caption || '').toLowerCase().includes('after') ||
        !!p.imageBefore ||
        (p.image && p.imageBefore);
      if (!isBeforeAfter) return false;
    }

    return true;
  });

  if (filters.sortBy === 'popular') {
    filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    filtered = [...filtered].sort((a, b) => {
      const ta = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const tb = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return tb - ta;
    });
  }

  return filtered;
}

/** Base suggestions: authors + keywords (parent passes to FeedSearch; FeedSearch filters by query) */
export function getBaseSuggestions(posts: FeedPost[]): string[] {
  const authors = Array.from(new Set(posts.map((p) => p.userName).filter(Boolean)));
  const keywords = posts.flatMap((p) =>
    (p.caption || '')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && /^[a-zA-Z]/.test(w))
  );
  const uniqueKeywords = Array.from(new Set(keywords.map((k) => k.toLowerCase())));
  return Array.from(new Set([...authors, ...uniqueKeywords]));
}

/** Derive search suggestions from posts: authors, keywords, trending terms */
export function getSearchSuggestions(
  posts: FeedPost[],
  query: string,
  limit = 8
): string[] {
  const base = getBaseSuggestions(posts);
  const lower = query.toLowerCase().trim();
  if (lower.length < 1) return base.slice(0, 5);
  return base
    .filter((s) => s.toLowerCase().includes(lower) && s.toLowerCase() !== lower)
    .slice(0, limit);
}
