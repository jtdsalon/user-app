import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid2,
  Fab,
  Zoom,
  Stack,
  Typography,
  Button
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import SalonRow from './SalonRow';
import RebookHero from '../Bookings/RebookHero';
import ArtisanRow from './ArtisanRow';
import ArtistCard, { ArtistCardSkeleton } from '../common/ArtistsCard/ArtistCard';
import SalonCard, { SalonCardSkeleton } from '../common/SalonCard/SalonCard';
import { MainLayout } from '../common/layouts/MainLayout';
import HomeSearchHeader from './HomeSearchHeader';
import HomeCategoryFilters from './HomeCategoryFilters';
import HomeSubViewHeader from './HomeSubViewHeader';
import { useHomeAction } from './hooks/useHomeAction';
import { useAuth } from '../Auth/AuthContext';
import type { Salon } from '../Salons/types';
import type { Artist } from '../common/ArtistsCard/types';

const HomeView: React.FC = () => {
  const { user } = useAuth();
  const [genderFilter, setGenderFilter] = useState<'all' | 'ladies' | 'men'>(
    (user?.gender as 'all' | 'ladies' | 'men') || 'all'
  );

  useEffect(() => {
    const g = user?.gender as 'all' | 'ladies' | 'men' | undefined;
    if (g === 'ladies' || g === 'men' || g === 'all') setGenderFilter(g);
  }, [user?.gender]);

  const {
    theme,
    isMobile,
    navigate,
    searchQuery,
    setSearchQuery,
    activeCategory,
    salonsByCategoryMap,
    categories,
    salonsByCategoryLoading,
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
    handleReturnToExplore,
    handleCategoryChange,
    handleLoadMoreCategory,
    prefetchCategory,
    loadMoreCategories,
    visibleCategoriesCount,
    categoryPagination,
    loadingMoreCategory,
    artisans,
    artisansLoading,
    artisansLoadingMore,
    artisanPagination,
    handleLoadMoreArtisans,
    artisanCategories,
    activeArtisanFilter,
    handleArtisanFilterChange
  } = useHomeAction(genderFilter);

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: { xs: 3, sm: 6 }, px: { xs: 2, sm: 4 }, pb: 10 }}>

        {!isDefaultHome && isMobile && (
          <Zoom in timeout={400}>
            <Fab
              size="medium"
              onClick={handleReturnToExplore}
              sx={{
                position: 'fixed',
                bottom: 88,
                right: 20,
                bgcolor: 'text.primary',
                color: 'secondary.main',
                zIndex: theme.zIndex.speedDial,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: '#1e293b' }
              }}
            >
              <ArrowLeft size={24} />
            </Fab>
          </Zoom>
        )}

        <HomeSearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSmartBooking={() => setIsSmartBookingOpen(true)}
          isMobile={isMobile}
        />

        <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', mb: 0.5 }}>
              Curated for {genderFilter === 'ladies' ? 'Her' : genderFilter === 'men' ? 'Him' : 'You'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Discover sanctuaries tailored to your aesthetic preference.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              p: 0.5,
              bgcolor: 'background.paper',
              borderRadius: '100px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'ladies', label: 'Ladies' },
              { id: 'men', label: 'Men' }
            ].map((g) => (
              <Button
                key={g.id}
                onClick={() => setGenderFilter(g.id as 'all' | 'ladies' | 'men')}
                size="small"
                sx={{
                  borderRadius: '100px',
                  px: 2.5,
                  minWidth: 80,
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  bgcolor: genderFilter === g.id ? 'text.primary' : 'transparent',
                  color: genderFilter === g.id ? 'background.paper' : 'text.secondary',
                  '&:hover': {
                    bgcolor: genderFilter === g.id ? 'text.secondary' : 'action.hover',
                  },
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                }}
              >
                {g.label}
              </Button>
            ))}
          </Box>
        </Box>

        {isArtisansRoute ? (
          <Box sx={{ mt: 2 }}>
            <HomeCategoryFilters
              categories={artisanCategories.length ? artisanCategories : ['All', 'Specialist', 'Colorist', 'Therapist']}
              activeCategory={activeArtisanFilter}
              onCategoryChange={handleArtisanFilterChange}
            />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <HomeCategoryFilters
              categories={categories.length ? categories : ['All', 'Hair', 'Spa', 'Massage']}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </Box>
        )}

        {isDefaultHome ? (
          <Box>
            {lastBooked && (
              <Box sx={{ mb: { xs: 6, sm: 10 } }}>
                <RebookHero
                  salon={lastBooked as any}
                  onRebook={() => handleOpenBooking(lastBooked as any)}
                  onViewProfile={() => navigate(`/salon/${lastBooked?.id}`)}
                />
              </Box>
            )}

            {salonsByCategoryLoading && categories.length <= 1 ? (
              <Box sx={{ mt: 4 }}>
                <SalonRow title="Loading..." category="" salons={[]} isLoading={true} favorites={favorites} onBook={() => { }} onViewProfile={() => { }} onToggleFavorite={() => { }} onViewAll={() => { }} />
              </Box>
            ) : (
              categories
                .filter((c: string) => c && c !== 'All' && c !== 'Favorites')
                .slice(0, visibleCategoriesCount)
                .map((cat: string, index: number) => {
                  const mapKey = `${cat}:${genderFilter}`;
                  const categorySalons = salonsByCategoryMap[mapKey] || [];
                  const catLoading =
                    !salonsByCategoryMap[mapKey]?.length && (salonsByCategoryLoading || categories.length <= 1);
                  const pagination = categoryPagination[mapKey];
                  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

                  const nextCat = categories.filter((c: string) => c && c !== 'All' && c !== 'Favorites')[index + 1];
                  return (
                    <SalonRow
                      key={cat}
                      title={cat}
                      category={cat}
                      salons={categorySalons}
                      isLoading={catLoading}
                      loadingMore={loadingMoreCategory === cat}
                      hasMore={!!hasMore}
                      favorites={favorites}
                      onBook={(s) => handleOpenBooking(s as any)}
                      onViewProfile={(id) => navigate(`/salon/${id}`)}
                      onToggleFavorite={toggleFavorite}
                      onViewAll={() => navigate(`/salons?category=${encodeURIComponent(cat)}`)}
                      onLoadMore={() => handleLoadMoreCategory(cat)}
                      onVisible={() => {
                        if (nextCat) prefetchCategory(nextCat);
                        if (index >= visibleCategoriesCount - 2) loadMoreCategories();
                      }}
                    />
                  );
                })
            )}
          </Box>
        ) : (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <HomeSubViewHeader
                title={isArtisansRoute ? 'Specialists' : (activeCategory === 'All' ? 'Lookbook' : activeCategory)}
                onClose={handleReturnToExplore}
              />
            </Stack>

            <Grid2 container spacing={isMobile ? 2 : 3}>
              {isArtisansRoute ? (
                artisansLoading ? (
                  Array.from(new Array(6)).map((_, i) => <Grid2 key={i} size={{ xs: 12, md: 6, lg: 4 }}><ArtistCardSkeleton /></Grid2>)
                ) : (
                  artisans.map((a: Artist) => <Grid2 key={a.id} size={{ xs: 12, md: 6, lg: 4 }}><ArtistCard artist={a} onBook={() => handleOpenArtistBooking(a)} /></Grid2>)
                )
              ) : (
                (categoryViewLoading ? (
                  Array.from(new Array(6)).map((_, i) => <Grid2 key={i} size={{ xs: 12, md: 6, lg: 4 }}><SalonCardSkeleton /></Grid2>)
                ) : (
                  filteredTraditionalSalons.map((salon: Salon) => (
                    <Grid2 key={salon.id} size={{ xs: 12, md: 6, lg: 4 }}>
                      <SalonCard
                        salon={salon as any}
                        onBook={(s) => handleOpenBooking(s as any)}
                        onViewProfile={() => navigate(`/salon/${salon.id}`)}
                        isFavorite={favorites.includes(salon.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </Grid2>
                  ))
                ))
              )}
            </Grid2>
          </Box>
        )}

        {/* <ArtisanRow
          artisans={artisans}
          isLoading={artisansLoading || salonsByCategoryLoading}
          loadingMore={artisansLoadingMore}
          hasMore={artisanPagination ? artisanPagination.page < artisanPagination.totalPages : false}
          onBook={handleOpenArtistBooking}
          onViewAll={() => navigate('/artisans')}
          onLoadMore={handleLoadMoreArtisans}
        /> */}
      </Container>
    </MainLayout>
  );
};

export default HomeView;
