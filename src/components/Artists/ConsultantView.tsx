import React from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  Stack,
  Avatar,
  Button,
  Fade,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Send,
  Camera,
  X,
  Crown,
  FlaskConical,
  User,
  Mic,
  MicOff,
  Download,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { useArtistsAction } from './hooks/useArtistsAction';
import { ARTISTS_PROPERTIES } from './properties';

const ConsultantView: React.FC = () => {
  const theme = useTheme();
  const {
    phase,
    setPhase,
    vibe,
    setVibe,
    diagnostic,
    setDiagnostic,
    messages,
    input,
    setInput,
    image,
    setImage,
    isLoading,
    isProcessingImage,
    analyticalStep,
    analyticalMessages,
    errorToast,
    setErrorToast,
    isListening,
    cameraOpen,
    videoRef,
    chatEndRef,
    toggleListening,
    startConsultation,
    startCamera,
    stopCamera,
    capturePhoto,
    handleImageUpload,
    handleDownload,
    handleSend,
  } = useArtistsAction();

  if (phase === 'vibe') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: 6, borderRadius: '48px', textAlign: 'center', border: `1px solid ${theme.palette.divider}` }}>
            <Crown size={48} color={theme.palette.secondary.main} style={{ marginBottom: 24 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              {ARTISTS_PROPERTIES.vibe.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 6 }}>
              {ARTISTS_PROPERTIES.vibe.subtitle}
            </Typography>
            <Stack spacing={2}>
              {ARTISTS_PROPERTIES.vibe.options.map((v) => (
                <Button
                  key={v}
                  variant="outlined"
                  fullWidth
                  onClick={() => { setVibe(v); setPhase('diagnostic'); }}
                  sx={{ 
                    py: 3, borderRadius: '24px', fontWeight: 800, fontSize: '16px',
                    borderColor: theme.palette.divider, color: 'text.primary',
                    '&:hover': { borderColor: theme.palette.secondary.main, bgcolor: 'rgba(212, 175, 55, 0.05)' }
                  }}
                >
                  {v.toUpperCase()}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (phase === 'diagnostic') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: 6, borderRadius: '48px', border: `1px solid ${theme.palette.divider}` }}>
            <FlaskConical size={32} color={theme.palette.secondary.main} style={{ marginBottom: 24 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {ARTISTS_PROPERTIES.diagnostic.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4 }}>
              {ARTISTS_PROPERTIES.diagnostic.subtitle}
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={ARTISTS_PROPERTIES.diagnostic.historyLabel}
                placeholder={ARTISTS_PROPERTIES.diagnostic.historyPlaceholder}
                value={diagnostic.history}
                onChange={(e) => setDiagnostic({ ...diagnostic, history: e.target.value })}
              />
              <Button
                variant="contained"
                onClick={startConsultation}
                fullWidth
                sx={{ py: 2, borderRadius: '100px', bgcolor: 'text.primary', color: 'background.paper', fontWeight: 800 }}
              >
                {ARTISTS_PROPERTIES.diagnostic.initCta}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 4, overflow: 'hidden' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, mb: 3, p: 3, borderRadius: '32px', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <Stack direction={msg.role === 'user' ? 'row-reverse' : 'row'} spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.main', color: msg.role === 'user' ? 'primary.main' : 'secondary.main', width: 36, height: 36 }}>
                    {msg.role === 'user' ? <User size={18} /> : <Crown size={18} />}
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, borderRadius: '20px', bgcolor: msg.role === 'user' ? 'action.hover' : 'transparent',
                        border: msg.role === 'ai' ? `1px solid ${theme.palette.divider}` : 'none'
                      }}
                    >
                      {msg.image && (
                        <Box component="img" src={msg.image} sx={{ width: '100%', maxWidth: 300, borderRadius: '12px', mb: 1, display: 'block' }} />
                      )}
                      {msg.generatedImage && (
                        <Box sx={{ mb: 2, position: 'relative' }}>
                          <Typography variant="overline" sx={{ fontWeight: 900, color: 'secondary.main', mb: 1, display: 'block' }}>
                            {ARTISTS_PROPERTIES.consult.stylePreview}
                          </Typography>
                          <Box sx={{ position: 'relative' }}>
                            <Box component="img" src={msg.generatedImage} sx={{ width: '100%', maxWidth: 400, borderRadius: '16px', border: `2px solid ${theme.palette.secondary.main}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                            <Tooltip title={ARTISTS_PROPERTIES.consult.downloadTooltip}>
                              <IconButton 
                                onClick={() => handleDownload(msg.generatedImage!, `glow-beauty-preview-${idx}.png`)}
                                sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: 'rgba(255,255,255,0.9)', color: 'text.primary', '&:hover': { bgcolor: '#fff' } }}
                              >
                                <Download size={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      )}
                      <Typography sx={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                    </Paper>
                  </Box>
                </Stack>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 2, alignItems: 'center' }}>
                <CircularProgress size={20} color="secondary" />
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>
                  {analyticalMessages[analyticalStep]}
                </Typography>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>
        </Paper>

        <Box sx={{ position: 'relative' }}>
          {image && (
            <Fade in>
              <Box sx={{ position: 'absolute', bottom: '100%', left: 0, p: 2, mb: 1, bgcolor: 'background.paper', borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box component="img" src={image} sx={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover' }} />
                <IconButton size="small" onClick={() => setImage(null)} sx={{ bgcolor: 'action.hover' }}><X size={14} /></IconButton>
              </Box>
            </Fade>
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={ARTISTS_PROPERTIES.consult.takeSelfie}>
              <IconButton 
                onClick={startCamera}
                sx={{ bgcolor: 'action.hover', color: 'text.primary', width: 48, height: 48 }}
              >
                <Camera size={20} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={ARTISTS_PROPERTIES.consult.uploadPhoto}>
              <IconButton 
                component="label"
                sx={{ bgcolor: 'action.hover', color: 'text.primary', width: 48, height: 48 }}
                disabled={isProcessingImage}
              >
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                {isProcessingImage ? <CircularProgress size={20} /> : <ImageIcon size={20} />}
              </IconButton>
            </Tooltip>

            <TextField 
              fullWidth
              placeholder={ARTISTS_PROPERTIES.consult.inputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              InputProps={{
                sx: { borderRadius: '100px', bgcolor: 'background.paper', '& fieldset': { borderColor: theme.palette.divider } },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={isListening ? ARTISTS_PROPERTIES.consult.listening : ARTISTS_PROPERTIES.consult.voiceInput}>
                      <IconButton 
                        onClick={toggleListening}
                        sx={{ color: isListening ? 'secondary.main' : 'text.secondary' }}
                      >
                        {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
            
            <IconButton 
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !image)}
              sx={{ bgcolor: 'text.primary', color: 'background.paper', width: 56, height: 56, '&:hover': { bgcolor: 'text.secondary' } }}
            >
              <Send size={24} />
            </IconButton>
          </Stack>
        </Box>
      </Container>

      {/* Camera Dialog */}
      <Dialog open={cameraOpen} onClose={stopCamera} PaperProps={{ sx: { borderRadius: '32px', overflow: 'hidden' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {ARTISTS_PROPERTIES.camera.title}
          <IconButton onClick={stopCamera} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, aspectRatio: '3/4', bgcolor: '#000' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={capturePhoto} 
            startIcon={<Zap size={18} />}
            sx={{ borderRadius: '100px', px: 4, py: 1.5, bgcolor: 'text.primary', fontWeight: 800 }}
          >
            {ARTISTS_PROPERTIES.camera.captureCta}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!errorToast} autoHideDuration={6000} onClose={() => setErrorToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorToast(null)}>{errorToast}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ConsultantView;
