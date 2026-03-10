import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Stack,
  Chip,
  Button,
  useTheme,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  TextField,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowUpRight,
  ChevronDown,
  Search,
  Sparkles,
  Star,
  ShieldCheck,
  FilterX,
  CheckCircle
} from 'lucide-react';
import { MainLayout } from '../common/layouts/MainLayout';
import JobApplicationDialog from './JobApplicationDialog';
import { useJobsAction } from './hooks/useJobsAction';
import { JOBS_PROPERTIES } from './properties';

const JobCardSkeleton = () => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        mb: 2
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={24} />
            <Skeleton width="20%" height={16} />
          </Box>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Skeleton width={100} height={32} sx={{ borderRadius: '100px' }} />
          <Skeleton width={100} height={32} sx={{ borderRadius: '100px' }} />
        </Stack>
      </Stack>
    </Paper>
  );
};

const JobsView: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const {
    searchQuery,
    setSearchQuery,
    expanded,
    loading,
    visibleJobs,
    appliedJobIds,
    isMoreLoading,
    apiLoadingMore,
    hasMore,
    hasMoreApi,
    filteredJobs,
    selectedJob,
    isApplyDialogOpen,
    handleApplySuccess,
    handleOpenApply,
    handleCloseApply,
    handleLoadMore,
    handleChange,
    handleNavigateToSalon,
    JOBS_PER_PAGE
  } = useJobsAction();

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ mt: { xs: 4, sm: 8 }, mb: 12 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, sm: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: { xs: '1.8rem', sm: '3rem' },
              mb: 2
            }}
          >
            {JOBS_PROPERTIES.pageTitle} <Box component="span" sx={{ color: 'secondary.main' }}>{JOBS_PROPERTIES.pageTitleHighlight}</Box>
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em', maxWidth: 600, mx: 'auto', mb: 6 }}>
            {JOBS_PROPERTIES.pageSubtitle}
          </Typography>

          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={JOBS_PROPERTIES.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '100px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  px: 2,
                  height: 64,
                  fontSize: '15px',
                  fontWeight: 500,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                  '&:hover': { borderColor: 'secondary.main' },
                  '&.Mui-focused': { borderColor: 'secondary.main' }
                }
              }}
              sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            />
          </Box>
        </Box>

        <Stack spacing={0}>
          {loading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : visibleJobs.length > 0 ? (
            visibleJobs.map((job, index) => (
              <Fade in timeout={400 + (index % JOBS_PER_PAGE) * 100} key={job.id}>
                <Box sx={{ pb: 3, position: 'relative' }}>
                  <Accordion
                    expanded={expanded === job.id}
                    onChange={handleChange(job.id)}
                    elevation={0}
                    disableGutters
                    sx={{
                      borderRadius: '32px !important',
                      border: '1px solid',
                      borderColor: expanded === job.id ? 'secondary.main' : 'divider',
                      bgcolor: 'background.paper',
                      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:before': { display: 'none' },
                      willChange: 'transform, box-shadow',
                      boxShadow: expanded === job.id ? '0 30px 60px rgba(0,0,0,0.12)' : 'none',
                      '.MuiAccordion-root:hover &': {
                        borderColor: 'secondary.main',
                        transform: expanded === job.id ? 'none' : 'translateY(-8px)',
                        boxShadow: expanded === job.id ? '0 30px 60px rgba(0,0,0,0.12)' : '0 20px 50px rgba(0,0,0,0.06)',
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ChevronDown size={22} />}
                      sx={{
                        px: { xs: 3, md: 5 },
                        py: { xs: 2, md: 3 },
                        '& .MuiAccordionSummary-content': { margin: 0 }
                      }}
                    >
                      <Grid2 container spacing={2} alignItems="center">
                        <Grid2 size={{ xs: 12, md: 8 }}>
                          <Stack direction="row" spacing={3} alignItems="center">
                            <Box
                              sx={{
                                p: 2,
                                bgcolor: 'action.hover',
                                borderRadius: '20px',
                                color: 'secondary.main',
                                display: { xs: 'none', sm: 'flex' }
                              }}
                            >
                              <Briefcase size={28} />
                            </Box>
                            <Box>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography
                                  variant="h5"
                                  sx={{
                                    fontWeight: 900,
                                    letterSpacing: '-0.02em',
                                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                                    mb: 0.5
                                  }}
                                >
                                  {job.title}
                                </Typography>
                                {appliedJobIds.includes(job.id) && (
                                  <Chip
                                    label={JOBS_PROPERTIES.appliedChip}
                                    size="small"
                                    color="success"
                                    icon={<CheckCircle size={12} />}
                                    sx={{
                                      height: 20,
                                      fontSize: '9px',
                                      fontWeight: 900,
                                      letterSpacing: '0.1em',
                                      borderRadius: '6px'
                                    }}
                                  />
                                )}
                              </Stack>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography
                                  onClick={job.salonId ? () => handleNavigateToSalon(job.salonId!) : undefined}
                                  sx={{
                                    color: 'secondary.main',
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    letterSpacing: '0.05em',
                                    ...(job.salonId && {
                                      cursor: 'pointer',
                                      '&:hover': { color: 'secondary.dark', opacity: 0.9 }
                                    })
                                  }}
                                >
                                  {job.salonName.toUpperCase()}
                                </Typography>
                                <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto', bgcolor: 'divider' }} />
                                <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '13px' }}>
                                  {JOBS_PROPERTIES.postedPrefix} {job.postedAt}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                            sx={{ mt: { xs: 2, md: 0 } }}
                          >
                            {(job.tags || []).map(tag => (
                              <Chip
                                key={tag}
                                label={tag.toUpperCase()}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '10px',
                                  height: 26,
                                  fontWeight: 900,
                                  borderColor: 'divider',
                                  color: 'text.secondary',
                                  letterSpacing: '0.1em',
                                  borderRadius: '8px'
                                }}
                              />
                            ))}
                          </Stack>
                        </Grid2>

                        <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
                          <Stack direction="row" spacing={{ xs: 2, md: 4 }} sx={{ color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MapPin size={16} color={theme.palette.secondary.main} />
                              <Typography sx={{ fontWeight: 700, fontSize: '13px' }}>{job.location}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography component="span" sx={{ fontWeight: 800, fontSize: '12px', color: 'secondary.main', letterSpacing: '0.02em' }}>Rs</Typography>
                              <Typography sx={{ fontWeight: 700, fontSize: '13px' }}>
                                {typeof job.salary === 'string' && job.salary.includes('$')
                                  ? 'LKR ' + job.salary.replace(/\$/g, '').replace(/\s+/g, ' ').trim()
                                  : job.salary}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Clock size={16} color={theme.palette.secondary.main} />
                              <Typography sx={{ fontWeight: 700, fontSize: '13px' }}>{job.type}</Typography>
                            </Box>
                          </Stack>
                        </Grid2>
                      </Grid2>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: { xs: 3, md: 5 }, pb: 5, pt: 0 }}>
                      <Divider sx={{ mb: 4 }} />

                      <Box
                        component="div"
                        className="job-description-html"
                        dangerouslySetInnerHTML={{ __html: job.description || '' }}
                        sx={{
                          color: 'text.primary',
                          fontWeight: 500,
                          lineHeight: 1.8,
                          mb: 5,
                          fontSize: '16px',
                          maxWidth: '800px',
                          '& h1, & h2, & h3': {
                            fontWeight: 800,
                            mb: 2,
                            mt: 2,
                            '&:first-of-type': { mt: 0 }
                          },
                          '& h1': { fontSize: '1.25rem' },
                          '& h2': { fontSize: '1.1rem' },
                          '& ul': { pl: 2.5, mb: 2 },
                          '& li': { mb: 1 },
                          '& p': { mb: 1.5 }
                        }}
                      />

                      <Grid2 container spacing={6}>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                          <Typography variant="overline" sx={{ fontWeight: 900, color: 'secondary.main', mb: 2, display: 'block', fontSize: '11px', letterSpacing: 2 }}>
                            {JOBS_PROPERTIES.responsibilities}
                          </Typography>
                          <List sx={{ p: 0 }}>
                            {(job.responsibilities || []).map((item, i) => (
                              <ListItem key={i} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                                <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                  <Sparkles size={16} color={theme.palette.secondary.main} />
                                </ListItemIcon>
                                <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '14px', lineHeight: 1.6 }}>{item}</Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 6 }}>
                          <Typography variant="overline" sx={{ fontWeight: 900, color: 'secondary.main', mb: 2, display: 'block', fontSize: '11px', letterSpacing: 2 }}>
                            {JOBS_PROPERTIES.qualifications}
                          </Typography>
                          <List sx={{ p: 0 }}>
                            {(job.qualifications || []).map((item, i) => (
                              <ListItem key={i} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                                <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                  <Star size={16} color={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
                                </ListItemIcon>
                                <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '14px', lineHeight: 1.6 }}>{item}</Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Grid2>

                        <Grid2 size={{ xs: 12 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 4,
                              borderRadius: '24px',
                              bgcolor: 'action.hover',
                              border: '1px solid',
                              borderColor: 'divider',
                              backgroundImage: isDarkMode ? 'none' : 'linear-gradient(to right, rgba(212, 175, 55, 0.05), transparent)'
                            }}
                          >
                            <Typography variant="overline" sx={{ fontWeight: 900, color: 'secondary.main', mb: 3, display: 'block', fontSize: '11px', letterSpacing: 2 }}>
                              {JOBS_PROPERTIES.sanctuaryExperience}
                            </Typography>
                            <Grid2 container spacing={3}>
                              {(job.benefits || []).map((item, i) => (
                                <Grid2 key={i} size={{ xs: 12, sm: 6 }}>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                      <ShieldCheck size={20} color={theme.palette.success.main} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '14px', color: 'text.primary' }}>{item}</Typography>
                                  </Stack>
                                </Grid2>
                              ))}
                            </Grid2>
                          </Paper>
                        </Grid2>
                      </Grid2>

                      <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Button
                          variant={appliedJobIds.includes(job.id) ? 'outlined' : 'contained'}
                          onClick={() => handleOpenApply(job)}
                          disabled={appliedJobIds.includes(job.id)}
                          endIcon={appliedJobIds.includes(job.id) ? <CheckCircle size={20} /> : <ArrowUpRight size={20} />}
                          sx={{
                            borderRadius: '100px',
                            bgcolor: appliedJobIds.includes(job.id) ? 'transparent' : 'text.primary',
                            color: appliedJobIds.includes(job.id) ? 'success.main' : 'background.paper',
                            borderColor: appliedJobIds.includes(job.id) ? 'success.main' : 'transparent',
                            fontWeight: 900,
                            px: 8, py: 2.5,
                            fontSize: '15px',
                            letterSpacing: '0.1em',
                            boxShadow: appliedJobIds.includes(job.id) ? 'none' : '0 20px 40px rgba(0,0,0,0.15)',
                            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                            '&:hover': {
                              bgcolor: appliedJobIds.includes(job.id) ? 'transparent' : 'secondary.main',
                              transform: appliedJobIds.includes(job.id) ? 'none' : 'scale(1.05)',
                              borderColor: appliedJobIds.includes(job.id) ? 'success.main' : 'transparent'
                            },
                            '&.Mui-disabled': {
                              color: 'success.main',
                              borderColor: 'success.main',
                              opacity: 0.8
                            }
                          }}
                        >
                          {appliedJobIds.includes(job.id) ? JOBS_PROPERTIES.applicationSent : JOBS_PROPERTIES.submitPortfolio}
                        </Button>
                        <Typography sx={{ mt: 3, fontSize: '12px', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em' }}>
                          {JOBS_PROPERTIES.applicationsDisclaimer}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Fade>
            ))
          ) : (
            <Fade in>
              <Box sx={{ textAlign: 'center', py: 12, opacity: 0.8 }}>
                <FilterX size={64} color={theme.palette.text.disabled} strokeWidth={1} style={{ marginBottom: 24 }} />
                <Typography variant="h5" fontWeight={900} color="text.secondary">{JOBS_PROPERTIES.noPositionsFound}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{JOBS_PROPERTIES.tryRefiningSearch}</Typography>
              </Box>
            </Fade>
          )}

          {(isMoreLoading || apiLoadingMore) && (
            <Stack spacing={3}>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </Stack>
          )}

          {(hasMore || hasMoreApi) && !isMoreLoading && !apiLoadingMore && (
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                onClick={handleLoadMore}
                sx={{
                  borderRadius: '100px',
                  border: '2px solid',
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 900,
                  px: 6, py: 1.5,
                  fontSize: '13px',
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: 'secondary.main', color: 'secondary.main', bgcolor: 'transparent', transform: 'translateY(-2px)' }
                }}
              >
                {JOBS_PROPERTIES.loadMoreOpportunities}
              </Button>
            </Box>
          )}

          {!hasMore && !hasMoreApi && filteredJobs.length > 0 && !isMoreLoading && !apiLoadingMore && (
            <Typography sx={{ textAlign: 'center', color: 'text.disabled', fontSize: '11px', fontWeight: 900, mt: 6, letterSpacing: '0.2em' }}>
              {JOBS_PROPERTIES.viewedAllPositions}
            </Typography>
          )}
        </Stack>
        <JobApplicationDialog
          open={isApplyDialogOpen}
          onClose={handleCloseApply}
          job={selectedJob}
          onSuccess={handleApplySuccess}
        />
      </Container>
    </MainLayout>
  );
};

export default JobsView;
