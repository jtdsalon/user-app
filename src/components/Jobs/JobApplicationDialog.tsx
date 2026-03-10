import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Button,
  CircularProgress,
  Fade,
  useTheme
} from '@mui/material';
import {
  User,
  Mail,
  Link as LinkIcon,
  FileText,
  Send,
  CheckCircle,
  X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { JobListing } from './constants';
import { JOB_APPLICATION_PROPERTIES } from './properties';
import { submitVacancyApplication, clearSubmitResult } from '@/state/vacancy';
import type { RootState } from '@/state/store';

interface JobApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  job: JobListing | null;
  onSuccess?: (jobId: string) => void;
}

const JobApplicationDialog: React.FC<JobApplicationDialogProps> = ({ open, onClose, job, onSuccess }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { submitLoading, submitError, submitSuccess } = useSelector((s: RootState) => s.vacancy);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    portfolio: '',
    resume: '',
    message: ''
  });

  useEffect(() => {
    if (!open) {
      dispatch(clearSubmitResult());
      setFormData({ name: '', email: '', portfolio: '', resume: '', message: '' });
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (submitSuccess && job?.id) {
      onSuccess?.(job.id);
      setTimeout(() => onClose(), 2500);
    }
  }, [submitSuccess, job?.id, onSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job?.id) return;
    dispatch(submitVacancyApplication({
      vacancyId: job.id,
      name: formData.name,
      email: formData.email,
      portfolio: formData.portfolio,
      resume: formData.resume || undefined,
      message: formData.message || undefined,
    }));
  };

  const handleCloseInternal = () => {
    onClose();
    setTimeout(() => {
      dispatch(clearSubmitResult());
      setFormData({ name: '', email: '', portfolio: '', resume: '', message: '' });
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseInternal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '40px',
          p: { xs: 2, sm: 4 },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }
      }}
    >
      {submitSuccess ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Fade in>
            <Box>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%',
                bgcolor: 'success.main', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3,
                boxShadow: '0 10px 30px rgba(46, 125, 50, 0.3)'
              }}>
                <CheckCircle size={40} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{JOB_APPLICATION_PROPERTIES.successTitle}</Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {job?.salonName ? JOB_APPLICATION_PROPERTIES.successMessage(job.salonName) : ''}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '13px', mt: 2 }}>
                {JOB_APPLICATION_PROPERTIES.successSubtext}
              </Typography>
            </Box>
          </Fade>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography sx={{ color: 'secondary.main', fontWeight: 900, fontSize: '11px', letterSpacing: '0.2em', mb: 1 }}>
                {JOB_APPLICATION_PROPERTIES.headerLabel}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                {job?.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {JOB_APPLICATION_PROPERTIES.atSalonPrefix} {job?.salonName}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseInternal} sx={{ color: 'text.secondary' }}>
              <X size={20} />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                required
                label={JOB_APPLICATION_PROPERTIES.fullNameLabel}
                placeholder={JOB_APPLICATION_PROPERTIES.fullNamePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
              />

              <TextField
                fullWidth
                required
                type="email"
                label={JOB_APPLICATION_PROPERTIES.emailLabel}
                placeholder={JOB_APPLICATION_PROPERTIES.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
              />

              <TextField
                fullWidth
                required
                label={JOB_APPLICATION_PROPERTIES.portfolioLabel}
                placeholder={JOB_APPLICATION_PROPERTIES.portfolioPlaceholder}
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
              />

              <TextField
                fullWidth
                label={JOB_APPLICATION_PROPERTIES.resumeLabel}
                placeholder={JOB_APPLICATION_PROPERTIES.resumePlaceholder}
                value={formData.resume}
                onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FileText size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label={JOB_APPLICATION_PROPERTIES.artisticStatementLabel}
                placeholder={JOB_APPLICATION_PROPERTIES.artisticStatementPlaceholder}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
              />

              {submitError && (
                <Typography color="error" sx={{ fontSize: '13px' }}>
                  {submitError}
                </Typography>
              )}

              <Box sx={{ pt: 2 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={submitLoading}
                  endIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : <Send size={18} />}
                  sx={{
                    borderRadius: '100px',
                    bgcolor: 'text.primary',
                    color: 'background.paper',
                    py: 2,
                    fontWeight: 900,
                    fontSize: '15px',
                    letterSpacing: '0.1em',
                    '&:hover': { bgcolor: 'secondary.main' }
                  }}
                >
                  {submitLoading ? JOB_APPLICATION_PROPERTIES.submitting : JOB_APPLICATION_PROPERTIES.submitApplication}
                </Button>
              </Box>
            </Stack>
          </form>
        </>
      )}
    </Dialog>
  );
};

export default JobApplicationDialog;
