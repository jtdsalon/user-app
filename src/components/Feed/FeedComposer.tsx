import React, { useState, useRef, useCallback } from 'react';
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
  useMediaQuery
} from '@mui/material';
import { Image as ImageIcon, Camera, Layers, X, Trash2 } from 'lucide-react';
import { FeedPost } from './types';
import { getFeedStrings } from './properties';
import { optimizeImage, getPreviewUrl } from '@/lib/util/imageProcessor';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import { searchUsersApi } from '@/services/api/userService';
import { MentionSuggestionDropdown, type MentionUser } from './components/MentionSuggestionDropdown';

const SEARCH_DEBOUNCE_MS = 250;

interface FeedComposerProps {
  open: boolean;
  onClose: () => void;
  onSave: (post: FeedPost) => void;
  currentUser: any;
  /** When editing, pre-fill with this post */
  initialPost?: FeedPost | null;
}

const COLORS = {
  primary: '#0F172A',
  accentGold: '#D4AF37',
  royalBlue: '#1E3A8A',
  textSecondary: '#64748b',
  border: '#F1F5F9',
  bgLight: '#FCFCFC',
};

const FeedComposer: React.FC<FeedComposerProps> = ({ open, onClose, onSave, currentUser, initialPost }) => {
  const theme = useTheme();
  const s = getFeedStrings();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [caption, setCaption] = useState('');
  const [imageAfter, setImageAfter] = useState<string | null>(null);
  const [imageBefore, setImageBefore] = useState<string | null>(null);
  const [previewUrlAfter, setPreviewUrlAfter] = useState<string | null>(null);
  const [previewUrlBefore, setPreviewUrlBefore] = useState<string | null>(null);
  const [isTransformation, setIsTransformation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({ open: false, message: '', severity: 'error' });
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open && initialPost) {
      setCaption(initialPost.caption || '');
      setImageAfter(initialPost.image || null);
      setImageBefore(initialPost.imageBefore || null);
      setPreviewUrlAfter(null);
      setPreviewUrlBefore(null);
      setIsTransformation(initialPost.isTransformation || false);
    } else if (open && !initialPost) {
      setCaption('');
      setImageAfter(null);
      setImageBefore(null);
      setPreviewUrlAfter(null);
      setPreviewUrlBefore(null);
      setIsTransformation(false);
    }
  }, [open, initialPost]);

  const previewUrlsRef = useRef<{ after: string | null; before: string | null }>({ after: null, before: null });
  previewUrlsRef.current = { after: previewUrlAfter, before: previewUrlBefore };
  React.useEffect(() => () => {
    const { after, before } = previewUrlsRef.current;
    if (after) URL.revokeObjectURL(after);
    if (before) URL.revokeObjectURL(before);
  }, []);

  const afterInputRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);

  const handleCaptionChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      const cursorPosition = e.target.selectionStart ?? 0;
      setCaption(value);

      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAt = textBeforeCursor.lastIndexOf('@');

      if (
        lastAt !== -1 &&
        (lastAt === 0 || textBeforeCursor[lastAt - 1] === ' ')
      ) {
        const query = textBeforeCursor.substring(lastAt + 1);
        if (!query.includes(' ')) {
          setShowSuggestions(true);
          setSelectedIndex(0);

          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(async () => {
            try {
              const res = await searchUsersApi(query);
              const data = res?.data?.data ?? [];
              setSuggestions(
                Array.isArray(data)
                  ? data.map((u: any) => ({
                      id: u.id,
                      name: u.name || 'User',
                      username: u.username || u.id,
                      avatar: u.avatar,
                    }))
                  : []
              );
            } catch {
              setSuggestions([]);
            }
            debounceRef.current = null;
          }, SEARCH_DEBOUNCE_MS);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    },
    []
  );

  const handleSelectMention = useCallback((user: MentionUser) => {
    const cursorPosition = textFieldRef.current?.selectionStart ?? caption.length;
    const textBeforeCursor = caption.substring(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    const newCaption =
      caption.substring(0, lastAt) +
      `@${user.username} ` +
      caption.substring(cursorPosition);

    setCaption(newCaption);
    setShowSuggestions(false);
    setTimeout(() => textFieldRef.current?.focus(), 0);
  }, [caption]);

  const handleUpload = (type: 'before' | 'after') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const prevImage = type === 'before' ? imageBefore : imageAfter;

    const previewUrl = getPreviewUrl(file);
    if (type === 'before') {
      setPreviewUrlBefore(previewUrl);
      setImageBefore(null);
    } else {
      setPreviewUrlAfter(previewUrl);
      setImageAfter(null);
    }
    setIsProcessing(true);

    try {
      const optimized = await optimizeImage(file, { maxWidth: 1600, quality: 0.85 });
      if (type === 'before') {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlBefore(null);
        setImageBefore(optimized);
      } else {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlAfter(null);
        setImageAfter(optimized);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image optimization failed';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      if (type === 'before') {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlBefore(null);
        setImageBefore(prevImage);
      } else {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlAfter(null);
        setImageAfter(prevImage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveInternal = () => {
    if (!caption.trim() && !imageAfter) return;

    onSave({
      id: initialPost?.id || Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || initialPost?.userId || 'me',
      userName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : s.common.anonymous,
      userAvatar: getFullImageUrl(currentUser?.avatar) || undefined,
      userType: 'customer',
      caption: caption.trim(),
      image: imageAfter || undefined,
      imageBefore: isTransformation ? imageBefore || undefined : undefined,
      isTransformation: isTransformation && !!imageAfter && !!imageBefore,
      likes: 0,
      timeAgo: s.common.justNow,
      comments: []
    });
    
    setCaption('');
    setImageAfter(null);
    setImageBefore(null);
    onClose();
  };

  const displayImg = (t: 'before' | 'after') => (t === 'after' ? (imageAfter || previewUrlAfter) : (imageBefore || previewUrlBefore));

  const ImageBox = ({ img, label, type, active }: any) => {
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
          '&:hover': { borderColor: theme.palette.secondary.main, bgcolor: isDarkMode ? 'rgba(226, 194, 117, 0.08)' : 'rgba(212, 175, 55, 0.05)' }
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
              onClick={(e) => {
                e.stopPropagation();
                const revoke = (url: string | null) => url && URL.revokeObjectURL(url);
                if (type === 'after') { revoke(previewUrlAfter); setPreviewUrlAfter(null); setImageAfter(null); }
                else { revoke(previewUrlBefore); setPreviewUrlBefore(null); setImageBefore(null); }
              }}
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
                <Typography sx={{ mt: 1, fontSize: isMobile ? '8px' : '10px', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.15em' }}>
                  {label.toUpperCase()}
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      fullScreen={isMobile}
      PaperProps={{ 
        sx: { 
          borderRadius: isMobile ? 0 : '48px', 
          p: isMobile ? 0 : 2, 
          bgcolor: 'background.paper', 
          backgroundImage: 'none' 
        } 
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: isMobile ? 2 : 4, pb: 2, position: 'relative' }}>
        {isMobile && (
          <IconButton 
            onClick={onClose} 
            sx={{ position: 'absolute', left: 16, top: 16, color: 'text.secondary' }}
          >
            <X size={20} />
          </IconButton>
        )}
        <Typography sx={{ color: 'secondary.main', fontWeight: 900, fontSize: isMobile ? '14px' : '18px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {initialPost ? s.composer.editEntry : s.composer.newEntry}
        </Typography>
        {isMobile && (
          <Button 
            onClick={handleSaveInternal} 
            disabled={isProcessing || (!caption.trim() && !imageAfter)}
            sx={{ position: 'absolute', right: 16, top: 16, fontWeight: 900, fontSize: '12px', color: 'secondary.main' }}
          >
            {initialPost ? s.composer.update : s.composer.publish}
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
            <ImageBox img={imageAfter || previewUrlAfter} label={s.composer.finalResult} type="after" />
            {isTransformation && (
              <Fade in><Box sx={{ flex: 1 }}><ImageBox img={imageBefore || previewUrlBefore} label={s.composer.before} type="before" active={!!(imageBefore || previewUrlBefore)} /></Box></Fade>
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
              '&:hover': {
                borderColor: 'secondary.main',
                bgcolor: 'rgba(212, 175, 55, 0.05)'
              }
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
          <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 700 }}>{s.composer.discard}</Button>
          <Button variant="contained" disabled={isProcessing || (!caption.trim() && !imageAfter)} onClick={handleSaveInternal} sx={{ borderRadius: '100px', bgcolor: 'text.primary', color: 'background.paper', px: 6, py: 1.5, fontWeight: 800, '&:hover': { bgcolor: 'text.secondary' } }}>{initialPost ? s.composer.updateButton : s.composer.publishButton}</Button>
        </DialogActions>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default FeedComposer;
