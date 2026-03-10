
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  IconButton,
  Grid2,
  Paper,
  Divider,
  Chip,
  Rating,
  Tabs,
  Tab,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Clock,
  Sparkles
} from 'lucide-react';
import { Salon } from '../Home/types';
import { MainLayout } from '../common/layouts/MainLayout';
import { useSalonProfileView } from './hooks/useSalonProfileView';
import ShareDialog from './ShareDialog';
import { SalonHeader } from './components/SalonHeader';
import { SalonOverviewTab } from './components/SalonOverviewTab';
import { SalonServicesTab } from './components/SalonServicesTab';
import { SalonReviewsTab } from './components/SalonReviewsTab';
import { SalonConnectCard } from './components/SalonConnectCard';

interface SalonProfileViewProps {
  salonId: string;
  onBack: () => void;
  onBook: (salon: Salon, preselectedServiceId?: string | null) => void;
}

const SalonProfileView: React.FC<SalonProfileViewProps> = ({ salonId, onBack, onBook }) => {
  const {
    theme,
    salon,
    loading,
    error,
    reviews,
    tabValue,
    setTabValue,
    isReviewModalOpen,
    setIsReviewModalOpen,
    newReview,
    setNewReview,
    submittingReview,
    reviewError,
    setReviewError,
    isShareOpen,
    setIsShareOpen,
    salonPosts,
    currentRating,
    groupedServices,
    openExternalLink,
    profileShareUrl,
    handleAddReview,
  } = useSalonProfileView(salonId);

  if (loading && !salon) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress color="secondary" />
        </Box>
      </MainLayout>
    );
  }

  if (error || !salon) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Salon not found'}
          </Alert>
          <Button onClick={onBack}>Go back</Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
        {/* Header Section based on visual spec */}
        <SalonHeader
          salon={salon}
          currentRating={currentRating}
          reviewCount={reviews.length}
          onBack={onBack}
          onBook={() => onBook(salon)}
          onShare={() => setIsShareOpen(true)}
          openExternalLink={openExternalLink}
        />

        {/* Content Tabs Section */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper elevation={0} sx={{ borderRadius: '32px', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', bgcolor: 'background.paper' }}>
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                centered
                sx={{
                  '& .MuiTabs-indicator': { bgcolor: 'secondary.main', height: 4, borderRadius: '4px 4px 0 0' },
                  '& .MuiTab-root': {
                    fontSize: '11px',
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    color: 'text.secondary',
                    minWidth: { xs: 80, md: 150 },
                    py: 3,
                    '&.Mui-selected': { color: 'text.primary' }
                  }
                }}
              >
                <Tab label="OVERVIEW" />
                <Tab label="SERVICES" />
                <Tab label={`ARCHIVE (${salonPosts.length})`} />
                <Tab label={`REVIEWS (${reviews.length})`} />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 4, md: 8 } }}>
              {tabValue === 0 && (
                <Fade in timeout={600}>
                  <Box>
                    <SalonOverviewTab
                      salon={salon}
                      openExternalLink={openExternalLink}
                      onOpenShare={() => setIsShareOpen(true)}
                      onClaimOffer={() => onBook(salon)}
                    />
                  </Box>
                </Fade>
              )}

              {/* Other tabs follow same structure */}
              {tabValue === 1 && (
                <Fade in timeout={600}>
                  <Box>
                    <SalonServicesTab
                      salon={salon}
                      groupedServices={groupedServices}
                      onBook={serviceId => onBook(salon, serviceId)}
                    />
                  </Box>
                </Fade>
              )}

              {tabValue === 2 && (
                <Fade in timeout={600}>
                  <Box>
                    <Grid2 container spacing={4}>
                      {salonPosts.map(post => (
                        <Grid2 key={post.id} size={{ xs: 12, md: 6 }}>
                          {/* <FeedItem post={post} /> */}
                        </Grid2>
                      ))}
                    </Grid2>
                    {salonPosts.length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 12 }}>
                        <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>NO ENTRIES ARCHIVED YET</Typography>
                      </Box>
                    )}
                  </Box>
                </Fade>
              )}

              {tabValue === 3 && (
                <Fade in timeout={600}>
                  <Box>
                    <SalonReviewsTab
                      salonName={salon.name}
                      reviews={reviews}
                      currentRating={currentRating}
                      onOpenReviewDialog={() => setIsReviewModalOpen(true)}
                    />
                  </Box>
                </Fade>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      <Dialog
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '32px', p: 1, backgroundImage: 'none' }
        }}
      >
        <DialogTitle component="div" sx={{ textAlign: 'center', pb: 0, pt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary' }}>
            Metamorphosis Reflection
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>
            Share your experience at {salon.name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Stack spacing={4} alignItems="center">
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.25em', mb: 2, color: 'secondary.main' }}>
                YOUR RATING
              </Typography>
              <Rating
                size="large"
                value={newReview.rating}
                onChange={(_, val) => setNewReview(prev => ({ ...prev, rating: val || 5 }))}
                sx={{ color: 'secondary.main' }}
              />
            </Box>

            <TextField
              fullWidth
              select
              label="Service Attended"
              value={newReview.service}
              onChange={(e) => setNewReview(prev => ({ ...prev, service: e.target.value }))}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
            >
              {salon.fullServices.map(s => (
                <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
              ))}
              <MenuItem value="Other">Other Service</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe the artisan's vision and the sanctuary atmosphere..."
              helperText="At least 3 characters"
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '24px' }
              }}
            />
          </Stack>
        </DialogContent>
        {reviewError && (
          <Alert severity="error" sx={{ mx: 4, mb: 2 }} onClose={() => setReviewError(null)}>
            {reviewError}
          </Alert>
        )}
        <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={() => setIsReviewModalOpen(false)}
            disabled={submittingReview}
            sx={{ color: 'text.secondary', fontWeight: 900, fontSize: '12px' }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleAddReview}
            disabled={!newReview.comment.trim() || newReview.comment.trim().length < 3 || submittingReview}
            startIcon={submittingReview ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
            sx={{
              bgcolor: 'text.primary', color: 'background.paper', borderRadius: '100px', px: 4, py: 1.5,
              fontWeight: 900, fontSize: '12px', letterSpacing: '0.1em',
              '&:hover': { bgcolor: 'text.secondary' }
            }}
          >
            POST REFLECTION
          </Button>
        </DialogActions>
      </Dialog>
      <ShareDialog
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={salon.name}
        url={profileShareUrl || (typeof window !== 'undefined' ? window.location.href : '')}
        image={salon.image || salon.coverImage}
        description={salon.description}
      />
    </MainLayout>
  );
};

export default SalonProfileView;
