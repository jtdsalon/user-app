
import React, { useState, useCallback } from 'react';
import { Box, TextField, InputAdornment, IconButton, useTheme, Tooltip, keyframes } from '@mui/material';
import { Search, Zap, Mic } from 'lucide-react';

interface HomeSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenSmartBooking: () => void;
  isMobile: boolean;
}

const pulseMic = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
`;

const HomeSearchHeader: React.FC<HomeSearchHeaderProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onOpenSmartBooking, 
  isMobile 
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onSearchChange(transcript);
    };

    recognition.start();
  }, [onSearchChange]);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mb: { xs: 4, sm: 8 }, display: 'flex', gap: 1.5, alignItems: 'center' }}>
      <TextField
        fullWidth
        placeholder={isMobile ? "Search salons..." : "Find hair, skin, or spa services..."}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={isListening ? "Listening..." : "Voice Search"}>
                <IconButton 
                  onClick={startVoiceSearch} 
                  size="small"
                  sx={{ 
                    color: isListening ? 'secondary.main' : 'text.secondary',
                    animation: isListening ? `${pulseMic} 1.5s infinite` : 'none',
                    bgcolor: isListening ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Mic size={18} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          sx: { 
            borderRadius: '100px', 
            height: { xs: 48, sm: 56 }, 
            bgcolor: 'background.paper', 
            border: 'none',
            boxShadow: mode === 'light' ? '0 10px 25px rgba(15,23,42,0.03)' : '0 10px 25px rgba(0,0,0,0.2)'
          }
        }}
        sx={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: '100px' }}
      />
      <Tooltip title="AI Smart Search">
        <IconButton 
          onClick={onOpenSmartBooking} 
          sx={{ 
            bgcolor: 'text.primary', 
            color: 'secondary.main', 
            width: { xs: 48, sm: 56 }, 
            height: { xs: 48, sm: 56 },
            '&:hover': { bgcolor: 'text.secondary' }
          }}
        >
          <Zap size={22} fill="currentColor" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default HomeSearchHeader;
