import React, { useEffect, useRef } from 'react';
import { Box, Grid2, Paper, Stack, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Clock, MapPin, Phone, Gift } from 'lucide-react';
import type { Salon } from '@/components/Home/types';
import { AvatarWithFallback } from '@/components/common/ImageWithFallback';
import { recordPromotionViewApi } from '@/services/api/bookingService';

const COLORS = {
  primary: '#0F172A',
  goldDark: '#A16207',
  textSecondary: '#64748B',
};

interface SalonOverviewTabProps {
  salon: Salon;
  openExternalLink: (url?: string | null) => void;
  onOpenShare: () => void;
  onClaimOffer?: () => void;
}

/**
 * SalonOverviewTab shows the salon bio, team, branches, and active offer.
 */
export const SalonOverviewTab: React.FC<SalonOverviewTabProps> = ({ salon, openExternalLink, onOpenShare, onClaimOffer }) => {
  const theme = useTheme();
  const recordedViewsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!salon?.offers?.length) return;
    salon.offers.forEach((offer) => {
      if (offer.id && !recordedViewsRef.current.has(offer.id)) {
        recordedViewsRef.current.add(offer.id);
        recordPromotionViewApi(offer.id).catch(() => {});
      }
    });
  }, [salon?.offers]);

  const handleClaimOffer = () => {
    if (salon.offers?.[0]?.id) {
      recordPromotionViewApi(salon.offers[0].id).catch(() => {});
    }
    onClaimOffer?.();
  };

  return (
    <Grid2 container spacing={6}>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 900,
              letterSpacing: '0.25em',
              color: 'secondary.main',
              display: 'block',
              mb: 2,
            }}
          >
            THE PHILOSOPHY
          </Typography>
          <Typography
            sx={{
              color: 'text.primary',
              fontSize: '20px',
              lineHeight: 1.8,
              fontWeight: 300,
              fontStyle: 'italic',
            }}
          >
            "{salon.bio}"
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              mt: 3,
              fontSize: '15px',
              lineHeight: 1.8,
              fontWeight: 500,
            }}
          >
            {salon.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography
            sx={{
              fontWeight: 900,
              letterSpacing: '0.15em',
              color: COLORS.goldDark,
              display: 'block',
              mb: 4,
              fontSize: '14px',
              textTransform: 'uppercase',
            }}
          >
            MEET THE ARTISANS
          </Typography>
          <Stack
            direction="row"
            spacing={6}
            sx={{ overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}
          >
            {salon.stylists.map(stylist => (
              <Box key={stylist.id} sx={{ textAlign: 'center', minWidth: 120 }}>
                <Box sx={{ position: 'relative', mb: 2, mx: 'auto', width: 100 }}>
                  <AvatarWithFallback
                    src={stylist.image}
                    alt={stylist.name}
                    placeholderType="staff"
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: COLORS.primary,
                      color: 'secondary.main',
                      fontSize: '36px',
                      fontWeight: 300,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                      transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover': { transform: 'scale(1.08)' },
                    }}
                  >
                    {stylist.initials}
                  </AvatarWithFallback>
                </Box>
                <Typography
                  sx={{ fontWeight: 800, fontSize: '15px', color: 'text.primary', mb: 0.5 }}
                >
                  {stylist.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: COLORS.textSecondary,
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {stylist.role}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 900,
              letterSpacing: '0.25em',
              color: 'secondary.main',
              display: 'block',
              mb: 3,
            }}
          >
            BRANCHES & LOCATIONS
          </Typography>
          <Grid2 container spacing={3}>
            {salon.branches.map(branch => (
              <Grid2 size={{ xs: 12, sm: 6 }} key={branch.id}>
                <Paper
                  elevation={0}
                  sx={theme => ({
                    p: 3,
                    borderRadius: '24px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'action.hover',
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: 'background.paper',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.03)',
                      transform: 'translateY(-4px)',
                    },
                  })}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      fontSize: '15px',
                      color: 'text.primary',
                    }}
                  >
                    {branch.name}
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <MapPin
                        size={16}
                        color={theme.palette.secondary.main}
                        style={{ marginTop: 2 }}
                      />
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      >
                        {branch.address}, {branch.city}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Clock size={16} color={theme.palette.secondary.main} />
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      >
                        {branch.hours}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Phone size={16} color={theme.palette.secondary.main} />
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: 'text.primary',
                          fontWeight: 900,
                        }}
                      >
                        {branch.phone}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <Stack spacing={4} sx={{ position: { md: 'sticky' }, top: 100 }}>
          {salon.offers.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '32px',
                bgcolor: 'primary.main',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
              }}
            >
              <Gift
                size={80}
                style={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  opacity: 0.1,
                  transform: 'rotate(15deg)',
                }}
              />
              <Typography
                sx={{
                  color: 'secondary.main',
                  fontWeight: 900,
                  fontSize: '10px',
                  letterSpacing: '0.25em',
                  mb: 2,
                }}
              >
                ACTIVE PROMOTION
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}
              >
                {salon.offers[0].title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  opacity: 0.7,
                  mb: salon.offers[0].code ? 2 : 3,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                {salon.offers[0].description}
              </Typography>
              {salon.offers[0].code && (
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    mb: 2,
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    display: 'inline-block',
                  }}
                >
                  Use code: {salon.offers[0].code}
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                onClick={handleClaimOffer}
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'primary.main',
                  fontSize: '11px',
                  fontWeight: 900,
                  borderRadius: '100px',
                  py: 1.5,
                  '&:hover': { bgcolor: 'secondary.light' },
                }}
              >
                CLAIM OFFER
              </Button>
            </Paper>
          )}

        </Stack>
      </Grid2>
    </Grid2>
  );
};

