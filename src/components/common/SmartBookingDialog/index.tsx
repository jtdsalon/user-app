
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  IconButton, 
  Stack, 
  Paper,
  Fade,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Slide
} from '@mui/material';
import { X, Zap, Sparkles, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { getSmartBookingLogic } from '../../../services/geminiService';
import { SALONS } from '../../Home/constants';
import { TransitionProps } from '@mui/material/transitions';

interface SmartBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onBookingComplete?: () => void;
  onViewSalon: (id: string) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SmartBookingDialog: React.FC<SmartBookingDialogProps> = ({ open, onClose, onViewSalon }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);

  const handleProcess = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    
    const prompt = `User request: "${query}". Based on this, analyze their needs. Catalog available: ${JSON.stringify(SALONS.map(s => ({id: s.id, name: s.name, category: s.category, location: s.location})))}. Select the most relevant salon.`;
    
    const result = await getSmartBookingLogic(prompt);
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullScreen={fullScreen}
      maxWidth="xs" 
      fullWidth
      TransitionComponent={fullScreen ? Transition : undefined}
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : '32px', p: fullScreen ? 0 : 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Zap size={22} fill={theme.palette.secondary.main} color={theme.palette.secondary.main} />
          <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em">AI Search Assistant</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}><X size={20} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', fontWeight: 600, lineHeight: 1.6 }}>
          Tell us what service you need or what style you're looking for, and we'll find the perfect match.
        </Typography>

        <TextField 
          fullWidth
          multiline
          rows={4}
          placeholder="e.g., 'I need a haircut in SoHo tomorrow' or 'I'm looking for a luxury spa with massage services'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderRadius: '24px', 
              bgcolor: 'action.hover',
              p: 2.5,
              fontSize: '14px',
              fontWeight: 500
            },
            mb: 4
          }}
        />

        <Button 
          fullWidth 
          variant="contained" 
          onClick={handleProcess}
          disabled={loading || !query.trim()}
          sx={{ 
            bgcolor: 'text.primary', 
            color: 'background.paper', 
            borderRadius: '100px', 
            py: 2,
            fontWeight: 900,
            letterSpacing: '0.1em',
            fontSize: '14px',
            '&:active': { transform: 'scale(0.96)' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'FIND MY SALON'}
        </Button>

        {suggestion && (
          <Fade in timeout={600}>
            <Box sx={{ mt: 5, pb: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 900, color: 'secondary.main', mb: 2, display: 'block', letterSpacing: 2 }}>
                RECOMMENDED MATCH
              </Typography>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: '28px', 
                  border: '2px solid', 
                  borderColor: 'secondary.main',
                  bgcolor: 'rgba(212, 175, 55, 0.05)'
                }}
              >
                {suggestion.suggestedSalonId ? (
                  (() => {
                    const suggestedSalon = SALONS.find(s => s.id === suggestion.suggestedSalonId);
                    if (!suggestedSalon) return null;
                    return (
                      <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box component="img" src={suggestedSalon.image} sx={{ width: 64, height: 64, borderRadius: '16px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Box>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{suggestedSalon.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>{suggestedSalon.location}</Typography>
                          </Box>
                        </Stack>
                        
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, fontWeight: 500 }}>
                          {suggestion.explanation}
                        </Typography>

                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={() => { onClose(); onViewSalon(suggestedSalon.id); }}
                          endIcon={<ArrowRight size={16} />}
                          sx={{ 
                            borderRadius: '100px', 
                            fontWeight: 900, 
                            bgcolor: 'text.primary', 
                            color: 'background.paper',
                            py: 1.5,
                            '&:active': { transform: 'scale(0.96)' }
                          }}
                        >
                          VIEW SALON
                        </Button>
                      </Stack>
                    );
                  })()
                ) : (
                   <Typography variant="body2" sx={{ fontWeight: 600 }}>{suggestion.explanation}</Typography>
                )}
              </Paper>
            </Box>
          </Fade>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SmartBookingDialog;
