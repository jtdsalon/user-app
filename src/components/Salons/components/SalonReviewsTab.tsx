import React from 'react';
import { Box, Grid2, Paper, Stack, Typography, Button, Rating } from '@mui/material';
import { Edit3 } from 'lucide-react';
import type { SalonReview } from '@/components/Home/types';
import { AvatarWithFallback } from '@/components/common/ImageWithFallback';

interface SalonReviewsTabProps {
  salonName: string;
  reviews: SalonReview[];
  currentRating: number;
  onOpenReviewDialog: () => void;
}

/**
 * SalonReviewsTab shows aggregate rating and individual customer reviews.
 */
export const SalonReviewsTab: React.FC<SalonReviewsTabProps> = ({
  salonName,
  reviews,
  currentRating,
  onOpenReviewDialog,
}) => {
  return (
    <Box>
      <Grid2 container spacing={6}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={theme => ({
              p: 5,
              borderRadius: '40px',
              bgcolor: 'action.hover',
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            })}
          >
            <Typography
              variant="h1"
              sx={{ fontWeight: 900, color: 'text.primary', mb: 1 }}
            >
              {currentRating}
            </Typography>
            <Rating
              value={currentRating}
              precision={0.5}
              readOnly
              size="large"
              sx={{ color: 'secondary.main', mb: 1.5 }}
            />
            <Typography
              sx={{
                fontSize: '14px',
                color: 'text.secondary',
                mb: 4,
                fontWeight: 700,
              }}
            >
              SANCTUARY RATING
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={onOpenReviewDialog}
              startIcon={<Edit3 size={16} />}
              sx={{
                borderRadius: '100px',
                bgcolor: 'text.primary',
                py: 2,
                fontSize: '11px',
                fontWeight: 900,
              }}
            >
              WRITE REFLECTION
            </Button>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {reviews.map(review => (
              <Paper
                key={review.id}
                elevation={0}
                sx={theme => ({
                  p: 4,
                  borderRadius: '32px',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                })}
              >
                <Stack
                  direction="row"
                  spacing={2.5}
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <AvatarWithFallback
                    src={review.userAvatar}
                    alt={review.userName}
                    placeholderType="avatar"
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{ fontWeight: 900, fontSize: '15px' }}
                    >
                      {review.userName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: 'text.secondary',
                        fontWeight: 700,
                      }}
                    >
                      {review.date.toUpperCase()}
                    </Typography>
                  </Box>
                  <Rating
                    value={review.rating}
                    size="small"
                    readOnly
                    sx={{ color: 'secondary.main' }}
                  />
                </Stack>
                <Typography
                  sx={{
                    fontSize: '15px',
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  "{review.comment}"
                </Typography>
                {review.reply && (
                  <Box
                    sx={theme => ({
                      mt: 2,
                      p: 2.5,
                      borderRadius: '20px',
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.06)'
                        : 'action.hover',
                      borderLeft: `4px solid ${theme.palette.secondary.main}`,
                    })}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}
                    >
                      SALON RESPONSE
                    </Typography>
                    <Typography sx={{ fontSize: '14px', lineHeight: 1.6, color: 'text.primary', fontStyle: 'italic' }}>
                      "{review.reply}"
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        </Grid2>
      </Grid2>
    </Box>
  );
};

