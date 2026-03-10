import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Image as ImageIcon, X, Camera } from 'lucide-react';
import { FeedPost } from './types';
import { optimizeImage } from '@/lib/util/imageProcessor';

interface FeedComposerProps {
  open: boolean;
  onClose: () => void;
  onSave: (post: FeedPost) => void;
  editingPost?: FeedPost | null;
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    type: 'salon' | 'customer';
  };
}

const FeedComposer: React.FC<FeedComposerProps> = ({
  open,
  onClose,
  onSave,
  editingPost,
  currentUser,
}) => {
  const theme = useTheme();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && editingPost) {
      setCaption(editingPost.caption);
      setImage(editingPost.image);
    } else if (open) {
      setCaption('');
      setImage('');
    }
  }, [open, editingPost]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const optimized = await optimizeImage(file, { maxWidth: 1080, quality: 0.8 });
        setImage(optimized);
      } catch (err) {
        console.error('Image optimization failed:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSave = () => {
    if (!caption.trim() || !image) return;

    const newPost: FeedPost = {
      id: editingPost?.id || Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userHandle: `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`,
      userAvatar: currentUser.avatar,
      userType: currentUser.type,
      image,
      caption,
      timestamp: editingPost?.timestamp || Date.now(),
      likes: editingPost?.likes || 0,
      comments: editingPost?.comments || 0,
      liked: editingPost?.liked || false,
    };

    onSave(newPost);
    setCaption('');
    setImage('');
  };

  const handleClose = () => {
    setCaption('');
    setImage('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '32px', p: 1 } }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', letterSpacing: '0.1em', pt: 3 }}>
        {editingPost ? 'EDIT MASTERPIECE' : 'SHARE YOUR AESTHETIC'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* User Info */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={currentUser.avatar} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'text.primary' }}>
                {currentUser.name}
              </Typography>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
                {currentUser.type === 'salon' ? 'Salon' : 'Customer'}
              </Typography>
            </Box>
          </Stack>

          {/* Caption Input */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Share your thoughts about this aesthetic moment..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: {
                fontSize: '13px',
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
            helperText={`${caption.length}/300 characters`}
          />

          {/* Image Section */}
          <Box>
            {image ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={image}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  onClick={() => setImage('')}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            ) : (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 3,
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {isProcessing ? (
                  <Stack alignItems="center" spacing={1}>
                    <CircularProgress size={24} />
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                      Optimizing...
                    </Typography>
                  </Stack>
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <ImageIcon size={32} color={theme.palette.primary.main} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'text.primary' }}>
                      Add Image
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
                      or drag and drop
                    </Typography>
                  </Stack>
                )}
              </Box>
            )}
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary', fontWeight: 700 }}>
          Discard
        </Button>
        <Button
          variant="contained"
          disabled={!caption.trim() || !image || isProcessing}
          onClick={handleSave}
          sx={{
            borderRadius: '100px',
            px: 4,
            fontWeight: 800,
            bgcolor: 'primary.main',
            color: 'background.paper',
          }}
        >
          {editingPost ? 'Update' : 'Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedComposer;
