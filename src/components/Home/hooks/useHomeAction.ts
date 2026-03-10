import { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, useMediaQuery } from '@mui/material';
import { getSalonCategories, getSalonsByCategory } from '@/state/salon';
import { getArtisans, getArtisanFilters } from '@/state/artisan';
import { useLayout } from '../../common/layouts/layoutContext';

const INITIAL_CATEGORIES_COUNT = 5;

export type HomeGenderFilter = 'all' | 'ladies' | 'men';

export const useHomeAction = (genderFilter: HomeGenderFilter = 'all') => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    salonsByCategory,
    salonsByCategoryMap,
    categoryPagination,
    categories,
    salonsByCategoryLoading,
    loadingMoreCategory
  } = useSelector((state: any) => state.salon);

  const {
    artisans,
    artisanFilters,
    loading: artisansLoading,
    loadingMore: artisansLoadingMore,
    pagination: artisanPagination,
    filtersLoading: artisanFiltersLoading
  } = useSelector((state: any) => state.artisan);

  const {
    isLoading: isViewLoading,
    favorites,
    toggleFavorite,
    handleOpenBooking,
    handleOpenArtistBooking,
    lastBooked,
    setIsSmartBookingOpen
  } = useLayout();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeArtisanFilter, setActiveArtisanFilter] = useState<string>('All');
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(INITIAL_CATEGORIES_COUNT);
  const requestedCategoriesRef = useRef<Set<string>>(new Set());
  const categoriesRequestedRef = useRef(false);
  const artisanFiltersRequestedRef = useRef(false);
  const artisansLastRequestRef = useRef<string | null>(null);

  const isArtisansRoute = location.pathname === '/artisans';
  const isDefaultHome =
    (location.pathname === '/' || location.pathname === '/home') &&
    activeCategory === 'All' &&
    searchQuery === '';

  useEffect(() => {
    if (categoriesRequestedRef.current) return;
    categoriesRequestedRef.current = true;
    dispatch(getSalonCategories() as any);
  }, [dispatch]);

  useEffect(() => {
    if (artisanFiltersRequestedRef.current) return;
    artisanFiltersRequestedRef.current = true;
    dispatch(getArtisanFilters() as any);
  }, [dispatch]);

  useEffect(() => {
    if (!isArtisansRoute && !isDefaultHome) return;
    const key = `${isArtisansRoute ? 'artisans' : 'home'}:${activeArtisanFilter}`;
    if (artisansLastRequestRef.current === key) return;
    artisansLastRequestRef.current = key;
    dispatch(getArtisans({ job_title: activeArtisanFilter === 'All' ? undefined : activeArtisanFilter, page: 1, limit: 12 }) as any);
  }, [dispatch, isArtisansRoute, isDefaultHome, activeArtisanFilter]);

  useEffect(() => {
    const catsToFetch = categories
      .filter((c: string) => c && c !== 'All' && c !== 'Favorites')
      .slice(0, visibleCategoriesCount);
    const g = genderFilter;
    catsToFetch.forEach((cat: string) => {
      const mapKey = `${cat}:${g}`;
      if (requestedCategoriesRef.current.has(mapKey)) return;
      const hasCached = (salonsByCategoryMap[mapKey]?.length ?? 0) > 0;
      if (hasCached) return;
      requestedCategoriesRef.current.add(mapKey);
      dispatch(getSalonsByCategory({ category: cat, page: 1, limit: 10, gender: g }) as any);
    });
  }, [dispatch, categories, visibleCategoriesCount, salonsByCategoryMap, genderFilter]);

  useEffect(() => {
    if (activeCategory && activeCategory !== 'All' && activeCategory !== 'Favorites') {
      const mapKey = `${activeCategory}:${genderFilter}`;
      if (requestedCategoriesRef.current.has(mapKey)) return;
      const hasCached = (salonsByCategoryMap[mapKey]?.length ?? 0) > 0;
      if (hasCached) return;
      requestedCategoriesRef.current.add(mapKey);
      dispatch(getSalonsByCategory({ category: activeCategory, page: 1, limit: 10, gender: genderFilter }) as any);
    }
  }, [dispatch, activeCategory, salonsByCategoryMap, genderFilter]);

  const allSalonsFromMap = useMemo(() => {
    const g = genderFilter;
    const keys = Object.keys(salonsByCategoryMap).filter((k) => k.endsWith(`:${g}`));
    const merged = keys.flatMap((k) => salonsByCategoryMap[k] || []);
    const seen = new Set<string>();
    return merged.filter((s: any) => {
      const id = s?.id || '';
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [salonsByCategoryMap, genderFilter]);

  const filteredTraditionalSalons = useMemo(() => {
    const mapKey = `${activeCategory}:${genderFilter}`;
    const source =
      activeCategory === 'All' || activeCategory === 'Favorites'
        ? allSalonsFromMap
        : salonsByCategoryMap[mapKey] ?? salonsByCategory;
    return source.filter((salon: any) => {
      const name = String(salon.name || '');
      const locationStr = String(salon.address || salon.location || salon.address || '');
      const matchesSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locationStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'All'
          ? true
          : activeCategory === 'Favorites'
            ? favorites.includes(salon.id)
            : true; // salonsByCategory already filtered by API
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, favorites, allSalonsFromMap, salonsByCategory, salonsByCategoryMap]);

  const sponsoredSalons = useMemo(
    () => allSalonsFromMap.filter((s: any) => s.sponsored || s.id === 's1' || s.id === 's11'),
    [allSalonsFromMap]
  );

  const topSalons = useMemo(
    () => allSalonsFromMap.filter((s: any) => Number(s.average_rating || s.rating || 0) >= 4.9),
    [allSalonsFromMap]
  );

  const handleReturnToExplore = () => {
    setActiveCategory('All');
    setSearchQuery('');
    navigate('/home');
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
  };

  const handleArtisanFilterChange = (filter: string) => {
    setActiveArtisanFilter(filter);
  };

  const prefetchCategory = (category: string) => {
    if (!category || category === 'All' || category === 'Favorites') return;
    const mapKey = `${category}:${genderFilter}`;
    if (requestedCategoriesRef.current.has(mapKey)) return;
    const hasCached = (salonsByCategoryMap[mapKey]?.length ?? 0) > 0;
    if (hasCached) return;
    requestedCategoriesRef.current.add(mapKey);
    dispatch(getSalonsByCategory({ category, page: 1, limit: 10, gender: genderFilter }) as any);
  };

  const loadMoreCategories = () => {
    setVisibleCategoriesCount((prev) => Math.min(prev + 2, categories.length));
  };

  const handleLoadMoreArtisans = () => {
    const { page, totalPages } = artisanPagination || {};
    if (!page || !totalPages || page >= totalPages || artisansLoadingMore) return;
    dispatch(getArtisans({ job_title: activeArtisanFilter === 'All' ? undefined : activeArtisanFilter, page: page + 1, limit: 12 }) as any);
  };

  const handleLoadMoreCategory = (category: string) => {
    const mapKey = `${category}:${genderFilter}`;
    const pagination = categoryPagination[mapKey];
    if (!pagination) return;
    const { page, totalPages } = pagination;
    if (page >= totalPages) return;
    if (loadingMoreCategory === category) return;
    dispatch(getSalonsByCategory({ category, page: page + 1, limit: 10, gender: genderFilter }) as any);
  };

  const categoryViewLoading = salonsByCategoryLoading;
  const artisanCategories = useMemo(() => {
    const titles = artisanFilters?.jobTitles || [];
    return ['All', ...titles.filter(Boolean)];
  }, [artisanFilters?.jobTitles]);

  return {
    theme,
    isMobile,
    navigate,
    searchQuery,
    setSearchQuery,
    activeCategory,
    salonsByCategory,
    salonsByCategoryMap,
    categoryPagination,
    categories,
    salonsByCategoryLoading,
    loadingMoreCategory,
    categoryViewLoading,
    isViewLoading,
    favorites,
    toggleFavorite,
    handleOpenBooking,
    handleOpenArtistBooking,
    lastBooked,
    setIsSmartBookingOpen,
    isArtisansRoute,
    isDefaultHome,
    filteredTraditionalSalons,
    sponsoredSalons,
    topSalons,
    handleReturnToExplore,
    handleCategoryChange,
    handleLoadMoreCategory,
    prefetchCategory,
    loadMoreCategories,
    visibleCategoriesCount,
    INITIAL_CATEGORIES_COUNT,
    artisans,
    artisansLoading,
    artisansLoadingMore,
    artisanPagination,
    handleLoadMoreArtisans,
    artisanCategories,
    activeArtisanFilter,
    handleArtisanFilterChange,
  };
};
