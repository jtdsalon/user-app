import React, { useRef, useEffect } from 'react';
import { Box, Stack, Typography, Button, useTheme, CircularProgress } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import SalonCard, { SalonCardSkeleton } from '../common/SalonCard/SalonCard';
import { Salon } from './types';

const HorizontalLoader = ({ isLoading }: { isLoading: boolean }) => (
  <Box
    sx={{
      minWidth: 160,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      opacity: isLoading ? 1 : 0,
      transition: 'opacity 0.3s'
    }}
  >
    <CircularProgress size={24} sx={{ color: 'secondary.main' }} />
    <Typography sx={{ fontSize: '8px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>
      LOADING MORE...
    </Typography>
  </Box>
);

interface SalonRowProps {
  title: string;
  category: string;
  salons: Salon[];
  isLoading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  favorites: string[];
  onBook: (salon: Salon) => void;
  onViewProfile: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onViewAll: () => void;
  onLoadMore?: () => void;
  onVisible?: () => void;
}

const SalonRow: React.FC<SalonRowProps> = ({
  title,
  category,
  salons,
  isLoading,
  loadingMore = false,
  hasMore = false,
  favorites,
  onBook,
  onViewProfile,
  onToggleFavorite,
  onViewAll,
  onLoadMore,
  onVisible
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onVisible || !rowRef.current) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) onVisible();
      },
      { root: null, rootMargin: '200px 0px', threshold: 0.1 }
    );
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [onVisible]);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    const scrollEl = scrollRef.current;
    const sentinelEl = sentinelRef.current;
    if (!scrollEl || !sentinelEl || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { threshold: 0.1, root: scrollEl, rootMargin: '0px 200px 0px 0px' }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

  const sectionTitleStyle = {
    fontWeight: 900,
    color: 'secondary.main',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    fontSize: { xs: '1.1rem', sm: '1.4rem' },
    lineHeight: 1.2
  };
  return (
    <Box ref={rowRef} sx={{ mb: 8 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: 30, height: 2, bgcolor: 'secondary.main' }} />
          <Typography variant="h4" sx={sectionTitleStyle}>{title}</Typography>
        </Stack>
        <Button
          onClick={onViewAll}
          endIcon={<ChevronRight size={14} />}
          sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}
        >
          SEE ALL
        </Button>
      </Stack>
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
          pb: 3,
          px: 1,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: '6px' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: mode === 'light' ? '#E2E8F0' : 'rgba(226, 194, 117, 0.2)',
            borderRadius: '100px'
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          scrollbarWidth: 'thin'
        }}
      >
        {isLoading ? (
          Array.from(new Array(6)).map((_, i) => (
            <Box key={i} sx={{ minWidth: { xs: '340px', sm: '420px' }, flexShrink: 0, scrollSnapAlign: 'start' }}>
              <SalonCardSkeleton />
            </Box>
          ))
        ) : (
          <>
            {salons.map((salon) => (
              <Box key={salon.id} sx={{ minWidth: { xs: '340px', sm: '420px' }, flexShrink: 0, scrollSnapAlign: 'start' }}>
                <SalonCard
                  salon={salon as any}
                  onBook={(s) => onBook(s as any)}
                  onViewProfile={() => onViewProfile(salon.id)}
                  isFavorite={favorites.includes(salon.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </Box>
            ))}
            {hasMore && (
              <Box ref={sentinelRef} sx={{ minWidth: 100, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <HorizontalLoader isLoading={loadingMore} />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(SalonRow);
