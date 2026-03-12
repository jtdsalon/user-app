import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  TextField,
  Stack,
  Fade,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Image as ImageIcon, Camera, Layers, X, Trash2 } from 'lucide-react';
import { MentionSuggestionDropdown } from '../components/MentionSuggestionDropdown';
import { useFeedComposerAction } from './hooks/useFeedComposerAction';
import type { FeedPost } from '../types';

interface FeedComposerProps {
  open: boolean;
  onClose: () => void;
  onSave: (post: FeedPost) => void;
  currentUser: any;
  initialPost?: FeedPost | null;
}

const FeedComposer: React.FC<FeedComposerProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

  const {
    s,
    caption,
    imageAfter,
    imageBefore,
    previewUrlAfter,
    previewUrlBefore,
    isTransformation,
    setIsTransformation,
    isProcessing,
    snackbar,
    closeSnackbar,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    setSelectedIndex,
    textFieldRef,
    afterInputRef,
    beforeInputRef,
    handleCaptionChange,
    handleSelectMention,
    handleUpload,
    removeImage,
    handleSaveInternal,
    displayImg,
  } = useFeedComposerAction(props);

  const ImageBox = ({ label, type, active }: { label: string; type: 'before' | 'after'; active?: boolean }) => {
    const src = displayImg(type);
    const isOptimizing = isProcessing && src === (type === 'after' ? previewUrlAfter : previewUrlBefore);
    return (
      <Box
        onClick={() => !isProcessing && (type === 'after' ? afterInputRef.current?.click() : beforeInputRef.current?.click())}
        sx={{
          flex: 1,
          height: isMobile ? 160 : 200,
          borderRadius: isMobile ? '24px' : '32px',
          border: active ? `2px solid ${theme.palette.secondary.main}` : `1.5px solid ${theme.palette.divider}`,
          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': { borderColor: theme.palette.secondary.main, bgcolor: isDarkMode ? 'rgba(226, 194, 117, 0.08)' : 'rgba(212, 175, 55, 0.05)' },
        }}
      >
        {src ? (
          <>
            <Box component="img" src={src} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {isOptimizing && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.4)' }}>
                <Stack alignItems="center" spacing={0.5}>
                  <CircularProgress size={28} sx={{ color: 'secondary.main' }} />
                  <Typography sx={{ fontSize: '9px', fontWeight: 800, color: 'white', letterSpacing: '0.15em' }}>CRAFTING AESTHETIC</Typography>
                </Stack>
              </Box>
            )}
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); removeImage(type); }}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }}
            >
              <Trash2 size={14} color="#ef4444" />
            </IconButton>
          </>
        ) : (
          <>
            {isProcessing ? <CircularProgress size={24} sx={{ color: 'secondary.main' }} /> : (
              <>
                {type === 'after' ? <ImageIcon size={isMobile ? 24 : 28} color={theme.palette.text.secondary} /> : <Camera size={isMobile ? 24 : 28} color={theme.palette.text.secondary} />}
                <Typography sx={{ mt: 1, fontSize: isMobile ? '8px' : '10px', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.15em' }}>{label.toUpperCase()}</Typography>
              </>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : '48px', p: isMobile ? 0 : 2, bgcolor: 'background.paper', backgroundImage: 'none' },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: isMobile ? 2 : 4, pb: 2, position: 'relative' }}>
        {isMobile && (
          <IconButton onClick={props.onClose} sx={{ position: 'absolute', left: 16, top: 16, color: 'text.secondary' }}>
            <X size={20} />
          </IconButton>
        )}
        <Typography sx={{ color: 'secondary.main', fontWeight: 900, fontSize: isMobile ? '14px' : '18px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {props.initialPost ? s.composer.editEntry : s.composer.newEntry}
        </Typography>
        {isMobile && (
          <Button
            onClick={handleSaveInternal}
            disabled={isProcessing || (!caption.trim() && !imageAfter)}
            sx={{ position: 'absolute', right: 16, top: 16, fontWeight: 900, fontSize: '12px', color: 'secondary.main' }}
          >
            {props.initialPost ? s.composer.update : s.composer.publish}
          </Button>
        )}
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 4 }}>
        <Stack spacing={isMobile ? 3 : 4} alignItems="center">
          <Box sx={{ width: '100%', position: 'relative' }}>
            <MentionSuggestionDropdown
              users={suggestions}
              open={showSuggestions}
              selectedIndex={selectedIndex}
              onSelect={handleSelectMention}
              onClose={() => setShowSuggestions(false)}
              position="below"
            />
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 4 : 2}
              placeholder={s.composer.captionPlaceholder}
              variant="standard"
              value={caption}
              inputRef={textFieldRef}
              onChange={handleCaptionChange}
              onKeyDown={(e) => {
                if (!showSuggestions || suggestions.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSelectMention(suggestions[selectedIndex]);
                }
              }}
              InputProps={{ disableUnderline: true, sx: { fontSize: isMobile ? '14px' : '15px', color: 'text.primary', fontWeight: 300 } }}
            />
          </Box>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: isMobile && isTransformation ? 'column' : 'row', gap: 2 }}>
            <ImageBox label={s.composer.finalResult} type="after" />
            {isTransformation && (
              <Fade in>
                <Box sx={{ flex: 1 }}>
                  <ImageBox label={s.composer.before} type="before" active={!!(imageBefore || previewUrlBefore)} />
                </Box>
              </Fade>
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={() => setIsTransformation(!isTransformation)}
            startIcon={<Layers size={18} />}
            sx={{
              borderRadius: '100px',
              px: 4,
              py: isMobile ? 1 : 1.5,
              borderColor: isTransformation ? 'secondary.main' : 'divider',
              color: isTransformation ? 'secondary.main' : 'text.secondary',
              fontWeight: 700,
              fontSize: isMobile ? '11px' : '13px',
              width: isMobile ? '100%' : 'auto',
              '&:hover': { borderColor: 'secondary.main', bgcolor: 'rgba(212, 175, 55, 0.05)' },
            }}
          >
            {s.composer.metamorphosisMode}
          </Button>
        </Stack>
        <input type="file" accept="image/*" ref={afterInputRef} style={{ display: 'none' }} onChange={handleUpload('after')} />
        <input type="file" accept="image/*" ref={beforeInputRef} style={{ display: 'none' }} onChange={handleUpload('before')} />
      </DialogContent>
      {!isMobile && (
        <DialogActions sx={{ justifyContent: 'center', gap: 3, pb: 6, px: 4 }}>
          <Button onClick={props.onClose} sx={{ color: 'text.secondary', fontWeight: 700 }}>{s.composer.discard}</Button>
          <Button variant="contained" disabled={isProcessing || (!caption.trim() && !imageAfter)} onClick={handleSaveInternal} sx={{ borderRadius: '100px', bgcolor: 'text.primary', color: 'background.paper', px: 6, py: 1.5, fontWeight: 800, '&:hover': { bgcolor: 'text.secondary' } }}>
            {props.initialPost ? s.composer.updateButton : s.composer.publishButton}
          </Button>
        </DialogActions>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default FeedComposer;
