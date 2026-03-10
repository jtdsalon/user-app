
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Stack, 
  Paper, 
  Avatar, 
  Chip, 
  useTheme, 
  IconButton, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Fade,
  Grow,
  InputAdornment,
  Grid2,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Sparkles, 
  History, 
  BookOpen, 
  Search,
  Camera,
  Trash2,
  ChevronRight,
  Heart,
  // Added missing User import
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../Home/types';
import { MainLayout } from '../common/layouts/MainLayout';
import { getMyBookingsApi, type MyBookingItem } from '../../services/api/bookingService';
import { formatLKR } from '@/lib/utils/currency';

function formatTime(isoTime: string | Date): string {
  if (isoTime == null) return '—';
  const str = typeof isoTime === 'string' ? isoTime : String(isoTime);
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) return str;
  return '—';
}

function formatDate(bookingDate: string): string {
  if (!bookingDate) return '—';
  const d = new Date(bookingDate);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const getUploadsUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = ((import.meta as any).env?.VITE_APP_BASE_URL as string) || 'http://localhost:5000/api';
  const origin = base.replace(/\/api\/?$/, '');
  return path.startsWith('/') ? `${origin}${path}` : `${origin}/uploads/${path}`;
};

function apiBookingToAppointment(b: MyBookingItem): Appointment {
  const salon = b.salon;
  const salonImageRaw = salon?.image_url || salon?.cover_image_url || '';
  const salonImage = getUploadsUrl(salonImageRaw);
  const serviceName = b.service?.name || 'Service';
  const bookingDate = b.booking_date;
  const dateStr = formatDate(bookingDate);
  const timeStr = formatTime(b.start_time as any);
  const timestamp = b.created_at ? new Date(b.created_at).getTime() : new Date(bookingDate).getTime();
  return {
    id: b.id,
    salonId: b.salon_id,
    salonName: salon?.name || 'Salon',
    salonImage,
    serviceNames: [serviceName],
    staffName: '—',
    date: dateStr,
    time: timeStr,
    totalPrice: b.service?.price ?? 0,
    timestamp,
    status: (b.status?.toLowerCase() as any) || 'upcoming',
    notes: undefined,
  };
}

function isValidAppointment(a: any): a is Appointment {
  return a && typeof a.id === 'string' && (a.date != null || a.booking_date != null || a.timestamp != null);
}

const BookingView: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<{ id: string; text: string } | null>(null);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const run = async () => {
      try {
        const res: any = await getMyBookingsApi({ page: 1, limit: 50 });
        const body = res?.data;
        const data = Array.isArray(body?.data) ? body.data : [];
        const fromApi = data.map((b: MyBookingItem) => apiBookingToAppointment(b));
        if (!cancelled) setAppointments(fromApi);
      } catch {
        const saved = localStorage.getItem('luxe_bookings');
        if (saved && !cancelled) {
          try {
            const parsed: any[] = JSON.parse(saved);
            const valid = parsed
              .filter(isValidAppointment)
              .map((a: any) => ({
                ...a,
                id: a.id || a.salonId || String(a.timestamp),
                salonName: a.salonName || 'Salon',
                salonImage: a.salonImage || '',
                serviceNames: Array.isArray(a.serviceNames) ? a.serviceNames : [a.serviceName].filter(Boolean) || ['Service'],
                staffName: a.staffName || '—',
                date: a.date || (a.booking_date ? formatDate(a.booking_date) : new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })),
                time: a.time || '—',
                totalPrice: a.totalPrice ?? 0,
                timestamp: a.timestamp ?? 0,
              } as Appointment))
              .sort((a, b) => b.timestamp - a.timestamp);
            setAppointments(valid);
          } catch (_) {
            setAppointments([]);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return appointments.filter(a => 
      (a.salonName || '').toLowerCase().includes(q) ||
      (a.serviceNames || []).some((s: string) => String(s).toLowerCase().includes(q))
    );
  }, [appointments, searchQuery]);

  const notesMap = useMemo(() => {
    try {
      const raw = localStorage.getItem('luxe_booking_notes');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [editingNote]);

  const getNote = (id: string) => notesMap[id] ?? '';

  const handleSaveNote = () => {
    if (!editingNote) return;
    try {
      const next = { ...notesMap, [editingNote.id]: editingNote.text };
      localStorage.setItem('luxe_booking_notes', JSON.stringify(next));
      setAppointments(prev => prev.map(a => a.id === editingNote.id ? { ...a, notes: editingNote.text } : a));
    } finally {
      setEditingNote(null);
    }
  };

  const handleClearJournal = () => {
    if (window.confirm("Are you sure you want to clear your local notes? (API bookings will remain.)")) {
      localStorage.removeItem('luxe_booking_notes');
      setAppointments(prev => prev.map(a => ({ ...a, notes: undefined })));
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ mt: { xs: 4, sm: 6 }, mb: 12 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, sm: 8 } }}>
          <Fade in timeout={800}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.2em',
                  fontSize: { xs: '1.4rem', sm: '2.4rem' },
                  mb: 1
                }}
              >
                My <Box component="span" sx={{ color: 'secondary.main' }}>Appointments</Box>
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                Keep track of your past and upcoming salon visits.
              </Typography>
            </Box>
          </Fade>

          <Box sx={{ mt: 5, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <TextField 
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: '100px', 
                  bgcolor: 'background.paper',
                  fontSize: '13px',
                  fontWeight: 600,
                  height: 44,
                  width: { xs: '100%', sm: 300 }
                }
              }}
            />
            {Object.keys(notesMap).length > 0 && (
               <Tooltip title="Clear Notes">
                 <IconButton onClick={handleClearJournal} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                   <Trash2 size={18} color={theme.palette.error.light} />
                 </IconButton>
               </Tooltip>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : filteredAppointments.length === 0 ? (
          <Fade in timeout={1200}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 6, sm: 10 }, 
                textAlign: 'center', 
                borderRadius: '40px', 
                border: `1.5px solid ${theme.palette.divider}`, 
                bgcolor: 'background.paper',
                backgroundImage: isDarkMode ? 'none' : 'linear-gradient(to bottom, #fff, #fdfcfb)'
              }}
            >
              <Box sx={{ mb: 3, opacity: 0.2 }}>
                <Calendar size={64} strokeWidth={1} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="text.secondary" gutterBottom>
                No Appointments Yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', lineHeight: 1.6, mb: 4 }}>
                Find a salon and book your first service to see it here.
              </Typography>
              <Button 
                variant="contained" 
                href="/home"
                sx={{ 
                  borderRadius: '100px', 
                  bgcolor: 'text.primary', 
                  px: 4, py: 1.5, 
                  fontWeight: 900,
                  letterSpacing: '0.1em'
                }}
              >
                BROWSE SALONS
              </Button>
            </Paper>
          </Fade>
        ) : (
          <Stack spacing={3}>
            {filteredAppointments.map((appt, index) => (
              <Grow in timeout={400 + index * 150} key={appt.id}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 2.5, sm: 4 }, 
                    borderRadius: '32px', 
                    border: '1.5px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar 
                        src={appt.salonImage} 
                        sx={{ 
                          width: { xs: 60, sm: 80 }, 
                          height: { xs: 60, sm: 80 }, 
                          borderRadius: '20px',
                          border: `2px solid ${theme.palette.divider}`
                        }} 
                      />
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.05em' }}>
                          {(appt.date || '').split(',')[0]?.toUpperCase() || '—'}
                        </Typography>
                        <Typography sx={{ fontSize: '18px', fontWeight: 900, lineHeight: 1 }}>
                          {(appt.date || '').split(' ').pop() || '—'}
                        </Typography>
                      </Box>
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 10 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="h6"
                              onClick={() => appt.salonId && navigate(`/salon/${appt.salonId}`)}
                              sx={{
                                fontWeight: 900,
                                fontSize: '1.2rem',
                                letterSpacing: '-0.01em',
                                ...(appt.salonId && {
                                  cursor: 'pointer',
                                  '&:hover': { color: 'secondary.main', textDecoration: 'underline' },
                                }),
                              }}
                            >
                              {appt.salonName}
                            </Typography>
                            {appt.status === 'completed' && <CheckCircle2 size={16} color={theme.palette.success.main} />}
                          </Stack>
                          <Typography sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', mt: 0.2 }}>
                            {(appt.serviceNames || []).join(' + ') || '—'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={appt.status?.toUpperCase() || 'UPCOMING'} 
                          size="small"
                          sx={{ 
                            height: 20,
                            bgcolor: appt.status === 'completed' ? 'action.hover' : 'text.primary', 
                            color: appt.status === 'completed' ? 'text.secondary' : 'background.paper', 
                            fontWeight: 900, 
                            fontSize: '9px',
                            letterSpacing: '0.05em'
                          }} 
                        />
                      </Box>

                      <Stack direction="row" spacing={3} sx={{ color: 'text.secondary', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Clock size={14} />
                          <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>{appt.time}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <User size={14} />
                          <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>WITH {(appt.staffName || '—').toUpperCase()}</Typography>
                        </Box>
                      </Stack>

                      <Box 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: '20px', 
                          bgcolor: 'action.hover', 
                          border: '1px dashed',
                          borderColor: 'divider',
                          position: 'relative'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '9px', letterSpacing: '0.1em' }}>
                            NOTES
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => setEditingNote({ id: appt.id, text: appt.notes ?? getNote(appt.id) })}
                            sx={{ color: 'secondary.main' }}
                          >
                            <Edit3 size={14} />
                          </IconButton>
                        </Box>
                        
                        <Typography 
                          sx={{ 
                            fontSize: '13px', 
                            color: appt.notes ? 'text.primary' : 'text.disabled',
                            fontStyle: appt.notes ? 'normal' : 'italic',
                            fontWeight: 500,
                            lineHeight: 1.6
                          }}
                        >
                          {(appt.notes ?? getNote(appt.id)) || "Add any notes about this visit..."}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Stack direction="row" spacing={1}>
                            {[1, 2].map(i => (
                               <Box 
                                 key={i} 
                                 sx={{ 
                                   width: 48, height: 48, borderRadius: '12px', 
                                   bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider',
                                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                                   cursor: 'pointer', transition: 'all 0.3s',
                                   '&:hover': { bgcolor: 'background.paper', borderColor: 'secondary.main' }
                                 }}
                               >
                                 <Camera size={16} color={theme.palette.text.disabled} />
                               </Box>
                            ))}
                         </Stack>
                         
                         <Button 
                            variant="text" 
                            endIcon={<ChevronRight size={14} />}
                            onClick={() => setDetailAppointment(appt)}
                            sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary' }}
                         >
                            VIEW DETAILS
                         </Button>
                      </Box>
                    </Grid2>
                  </Grid2>
                </Paper>
              </Grow>
            ))}
          </Stack>
        )}

        {/* Booking Details Dialog */}
        <Dialog
          open={Boolean(detailAppointment)}
          onClose={() => setDetailAppointment(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '32px',
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {detailAppointment && (
            <>
              <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={detailAppointment.salonImage}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      border: `2px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      onClick={() => detailAppointment.salonId && (setDetailAppointment(null), navigate(`/salon/${detailAppointment.salonId}`))}
                      sx={{
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        ...(detailAppointment.salonId && {
                          cursor: 'pointer',
                          '&:hover': { color: 'secondary.main', textDecoration: 'underline' },
                        }),
                      }}
                    >
                      {detailAppointment.salonName}
                    </Typography>
                    <Typography sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                      {(detailAppointment.serviceNames || []).join(' + ') || '—'}
                    </Typography>
                  </Box>
                  <Chip
                    label={(detailAppointment.status || 'upcoming').toUpperCase()}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: detailAppointment.status === 'completed' ? 'action.hover' : 'text.primary',
                      color: detailAppointment.status === 'completed' ? 'text.secondary' : 'background.paper',
                      fontWeight: 900,
                      fontSize: '9px',
                      letterSpacing: '0.05em',
                    }}
                  />
                </Box>
              </DialogTitle>
              <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Calendar size={20} color={theme.palette.text.secondary} />
                    <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                      {detailAppointment.date}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Clock size={20} color={theme.palette.text.secondary} />
                    <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                      {detailAppointment.time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <User size={20} color={theme.palette.text.secondary} />
                    <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                      {detailAppointment.staffName || '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '12px' }}>
                      Total
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'secondary.main' }}>
                      {formatLKR(detailAppointment.totalPrice ?? 0)}
                    </Typography>
                  </Box>
                  {(detailAppointment.notes || getNote(detailAppointment.id)) && (
                    <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '9px', letterSpacing: '0.1em' }}>
                        Notes
                      </Typography>
                      <Typography sx={{ fontSize: '13px', color: 'text.primary', mt: 0.5, lineHeight: 1.6 }}>
                        {detailAppointment.notes || getNote(detailAppointment.id)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  onClick={() => setDetailAppointment(null)}
                  sx={{ color: 'text.secondary', fontWeight: 800, order: { xs: 2, sm: 0 } }}
                >
                  CLOSE
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ChevronRight size={16} />}
                  onClick={() => {
                    setDetailAppointment(null);
                    navigate(`/salon/${detailAppointment.salonId}`);
                  }}
                  sx={{
                    borderRadius: '100px',
                    bgcolor: 'text.primary',
                    color: 'background.paper',
                    px: 3,
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                  }}
                >
                  VIEW SALON
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog 
          open={Boolean(editingNote)} 
          onClose={() => setEditingNote(null)}
          PaperProps={{ sx: { borderRadius: '28px', p: 1, maxWidth: 400, width: '100%' } }}
        >
          <DialogTitle sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Visit Notes</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
              Add some notes about your visit (style, colors used, etc.)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Start writing..."
              value={editingNote?.text || ''}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, text: e.target.value } : null)}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '20px', 
                  bgcolor: 'action.hover',
                  fontSize: '14px'
                } 
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditingNote(null)} sx={{ color: 'text.secondary', fontWeight: 800 }}>CANCEL</Button>
            <Button 
              onClick={handleSaveNote} 
              variant="contained" 
              sx={{ 
                borderRadius: '100px', 
                bgcolor: 'text.primary', 
                px: 3, 
                fontWeight: 900,
                '&:hover': { bgcolor: 'secondary.main' }
              }}
            >
              SAVE NOTE
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default BookingView;
