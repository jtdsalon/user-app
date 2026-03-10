import React from 'react';
import { Box, Paper, Stack, Typography, Button, IconButton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { ArrowLeft, CheckCircle2, Crown, Star, Share2, Instagram, Facebook, Globe, Music2 } from 'lucide-react';
import type { Salon } from '@/components/Home/types';
import { AvatarWithFallback, ImageWithFallback } from '@/components/common/ImageWithFallback';

const GOLD = '#EAB308';
const DARK_BG = '#0B1224';
const DARK_BG_TOP = '#050914';

interface SalonHeaderProps {
  salon: Salon;
  currentRating: number;
  reviewCount: number;
  onBack: () => void;
  onBook: () => void;
  onShare: () => void;
  openExternalLink?: (url: string | null) => void;
}

/**
 * SalonHeader renders the hero section with cover, avatar, handle, stats, and primary CTA.
 */
export const SalonHeader: React.FC<SalonHeaderProps> = ({
  salon,
  currentRating,
  reviewCount,
  onBack,
  onBook,
  onShare,
  openExternalLink,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isOpen = salon.status === 'online';
  const hoursStr = salon.hours || 'N/A';
  const hoursParts = hoursStr.split('-');
  const closingTime = hoursParts.length > 1 ? hoursParts[1].trim() : '';
  const statusText = isOpen ? `OPEN UNTIL ${closingTime}` : hoursStr;
  const handle = (salon as { handle?: string }).handle ?? salon.name.replace(/\s+/g, '').toLowerCase();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: '24px', md: '40px' },
        overflow: 'hidden',
        bgcolor: isDark ? DARK_BG : 'background.paper',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
        mb: 6,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          height: 200,
          width: '100%',
          position: 'relative',
          bgcolor: isDark ? DARK_BG_TOP : alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <ImageWithFallback
          src={salon.coverImage || salon.image}
          alt={`${salon.name} cover`}
          placeholderType="cover"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isDark ? 0.6 : 0.8,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? `linear-gradient(to bottom, transparent 30%, ${DARK_BG} 100%)`
              : `linear-gradient(to bottom, transparent 30%, ${theme.palette.background.paper} 100%)`,
          }}
        />
        <IconButton
          onClick={onBack}
          sx={{
            position: 'absolute',
            top: 24,
            left: 24,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: '#0F172A',
            zIndex: 10,
            '&:hover': { bgcolor: '#fff', transform: 'scale(1.1)' },
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>
      </Box>

      <Box sx={{ px: { xs: 3, md: 6 }, pb: 6, mt: -8, position: 'relative' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'center', md: 'flex-end' }}
        >
          <Box sx={{ position: 'relative' }}>
            <AvatarWithFallback
              src={salon.image || salon.coverImage}
              alt={salon.name}
              placeholderType="avatar"
              sx={{
                width: 120,
                height: 120,
                border: '6px solid',
                borderColor: isDark ? DARK_BG : 'background.paper',
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 10px 20px rgba(0,0,0,0.1)',
              }}
            />
            {salon.isVerified && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  minHeight: 36,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: GOLD,
                  borderRadius: '50%',
                  border: '3px solid',
                  borderColor: isDark ? DARK_BG : 'background.paper',
                  boxSizing: 'border-box',
                }}
              >
                <Crown size={16} color={DARK_BG_TOP} />
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, pb: 1 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                {salon.name}
              </Typography>
              {salon.isVerified && <CheckCircle2 size={24} color={GOLD} fill={GOLD} />}
            </Stack>

            <Stack
              direction="row"
              spacing={2.5}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mb: 2 }}
            >
              <Typography
                sx={{
                  color: GOLD,
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  fontSize: '11px',
                }}
              >
                @{handle.toUpperCase()}
              </Typography>
              <Stack direction="row" spacing={1}>
                {salon.socials?.instagram && salon.socials.instagram.trim() && (
                  <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', p: 0.5, '&:hover': { color: GOLD } }}
                    onClick={() => openExternalLink?.(salon.socials?.instagram ?? null)}
                  >
                    <Instagram size={16} />
                  </IconButton>
                )}
                {salon.socials?.facebook && salon.socials.facebook.trim() && (
                  <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', p: 0.5, '&:hover': { color: GOLD } }}
                    onClick={() => openExternalLink?.(salon.socials?.facebook ?? null)}
                  >
                    <Facebook size={16} />
                  </IconButton>
                )}
                {salon.socials?.website && salon.socials.website.trim() && (
                  <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', p: 0.5, '&:hover': { color: GOLD } }}
                    onClick={() => openExternalLink?.(salon.socials?.website ?? null)}
                  >
                    <Globe size={16} />
                  </IconButton>
                )}
                {salon.socials?.tiktok && (salon.socials as { tiktok?: string }).tiktok?.trim() && (
                  <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', p: 0.5, '&:hover': { color: GOLD } }}
                    onClick={() => openExternalLink?.((salon.socials as { tiktok?: string }).tiktok ?? null)}
                  >
                    <Music2 size={16} />
                  </IconButton>
                )}
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              flexWrap="wrap"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Star size={14} fill={GOLD} color={GOLD} />
                <Typography sx={{ fontWeight: 900, color: 'text.primary', fontSize: '13px' }}>
                  {currentRating}
                </Typography>
                <Typography
                  sx={{ color: 'text.secondary', opacity: 0.7, fontSize: '12px', fontWeight: 700 }}
                >
                  ({reviewCount} reviews)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '12px',
                    color: isOpen ? '#10B981' : 'text.secondary',
                  }}
                >
                  {statusText}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <IconButton
              onClick={onShare}
              sx={{
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'divider',
                color: 'text.primary',
                p: 1.5,
                borderRadius: '16px',
              }}
            >
              <Share2 size={20} />
            </IconButton>
            <Button
              variant="contained"
              onClick={onBook}
              sx={{
                bgcolor: isDark ? GOLD : '#0f172a',
                color: isDark ? DARK_BG_TOP : '#fff',
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                '&:hover': { bgcolor: isDark ? '#fff' : GOLD, color: '#0f172a' },
              }}
            >
              BOOK NOW
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};
