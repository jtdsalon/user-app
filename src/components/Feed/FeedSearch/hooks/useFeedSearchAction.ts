import { useState, useEffect, useRef, useCallback } from 'react';
import type { FeedFilters } from '../types';

const TRENDING_TAGS = ['#skincare', '#minimal', '#glow', '#aesthetic', '#hair', '#makeup'];
const CATEGORIES = ['skincare', 'hair', 'nails', 'makeup', 'wellness'];

export interface UseFeedSearchActionProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  activeFilters: FeedFilters;
  onFilterChange?: (filters: FeedFilters) => void;
  suggestions?: string[];
}

export function useFeedSearchAction({
  searchQuery,
  onSearch,
  activeFilters,
  onFilterChange,
  suggestions = [],
}: UseFeedSearchActionProps) {
  const [queryLocal, setQueryLocal] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => setQueryLocal(searchQuery), [searchQuery]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(queryLocal), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [queryLocal, onSearch]);

  const handleClear = useCallback(() => {
    setQueryLocal('');
    onSearch('');
    setShowSuggestions(false);
  }, [onSearch]);

  const handleTagClick = useCallback(
    (tag: string) => {
      const cleanTag = tag.replace('#', '');
      setQueryLocal(cleanTag);
      onSearch(cleanTag);
      setShowSuggestions(false);
    },
    [onSearch]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQueryLocal(suggestion);
      onSearch(suggestion);
      setShowSuggestions(false);
    },
    [onSearch]
  );

  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClickMobile = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleFilterClose = useCallback(() => {
    setAnchorEl(null);
    setIsDrawerOpen(false);
  }, []);

  const toggleCategory = useCallback(
    (cat: string) => {
      const newCats = activeFilters.categories.includes(cat)
        ? activeFilters.categories.filter((c) => c !== cat)
        : [...activeFilters.categories, cat];
      const newFilters = { ...activeFilters, categories: newCats };
      onFilterChange?.(newFilters);
    },
    [activeFilters, onFilterChange]
  );

  const handleSortChange = useCallback(
    (sort: 'newest' | 'popular') => {
      const newFilters = { ...activeFilters, sortBy: sort };
      onFilterChange?.(newFilters);
      handleFilterClose();
    },
    [activeFilters, onFilterChange, handleFilterClose]
  );

  const handleTypeChange = useCallback(
    (type: 'all' | 'before-after') => {
      onFilterChange?.({ ...activeFilters, contentType: type });
    },
    [activeFilters, onFilterChange]
  );

  const handleResetFilters = useCallback(() => {
    const reset: FeedFilters = { categories: [], sortBy: 'newest', contentType: 'all' };
    onFilterChange?.(reset);
    handleFilterClose();
  }, [onFilterChange, handleFilterClose]);

  const activeFilterCount =
    activeFilters.categories.length +
    (activeFilters.sortBy !== 'newest' ? 1 : 0) +
    (activeFilters.contentType !== 'all' ? 1 : 0);

  const allSuggestions = Array.from(new Set([...suggestions, ...TRENDING_TAGS.map(t => t.replace('#', ''))]));
  const filteredSuggestions = allSuggestions
    .filter(
      (s) =>
        s.toLowerCase().includes(queryLocal.toLowerCase().trim()) &&
        s.toLowerCase() !== queryLocal.toLowerCase().trim()
    )
    .slice(0, 8);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSuggestions(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const setQueryLocalAndShowSuggestions = useCallback((v: string) => {
    setQueryLocal(v);
    setShowSuggestions(true);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);

  return {
    queryLocal,
    setQueryLocal: setQueryLocalAndShowSuggestions,
    isFocused,
    showSuggestions,
    setShowSuggestions,
    anchorEl,
    open,
    isDrawerOpen,
    setIsDrawerOpen,
    containerRef,
    handleClear,
    handleTagClick,
    handleSuggestionClick,
    handleFilterClick,
    handleFilterClickMobile,
    handleFilterClose,
    toggleCategory,
    handleSortChange,
    handleTypeChange,
    handleResetFilters,
    handleBlur,
    handleFocus,
    activeFilterCount,
    filteredSuggestions,
    TRENDING_TAGS,
    CATEGORIES,
  };
}
