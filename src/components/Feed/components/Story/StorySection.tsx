import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  InputBase,
  Stack,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Camera, Image as ImageIcon, Trash2, Plus, Send } from 'lucide-react';
import { splitContentWithMentions } from '../../utils/parseMentions';
import { MentionSuggestionDropdown } from '../MentionSuggestionDropdown';
import { useStorySectionAction } from './hooks/useStorySectionAction';
import type { Story } from '@/services/api/storyService';

function renderStoryTitleWithMentions(
  title: string,
  sx?: { color?: string },
  onMentionClick?: (username: string) => void
) {
  const parts = splitContentWithMentions(title);
  return parts.map((part, i) => {
    if (typeof part === 'string') return part;
    const { username } = part;
    return (
      <Box
        key={i}
        component="span"
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onMentionClick?.(username);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onMentionClick?.(username);
          }
        }}
        sx={{
          color: sx?.color ?? 'secondary.main',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          '&:hover': { textDecoration: 'underline' },
          '&:focus-visible': { textDecoration: 'underline', outline: '1px solid' },
        }}
      >
        @{username}
      </Box>
    );
  });
}

export const StorySection: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const {
    user,
    fileInputRef,
    storyInputRef,
    inputContainerRef,
    stories,
    isLoading,
    isSubmitting,
    isDialogOpen,
    setIsDialogOpen,
    newStory,
    storyToDelete,
    setStoryToDelete,
    snackbar,
    closeSnackbar,
    isProcessingImages,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    setSelectedIndex,
    selectedStory,
    setSelectedStory,
    currentImageIndex,
    handleFileSelect,
    removeImage,
    handleTitleChange,
    handleSelectMention,
    handleAddStory,
    handleDeleteStory,
    confirmDelete,
    openStory,
    nextImage,
    prevImage,
  } = useStorySectionAction();

  return (
    <Box sx={{ mb: 6, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 2 }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'text.secondary', textTransform: 'uppercase' }}>
          Glow Rituals
        </Typography>
        <Sparkles size={14} color={theme.palette.secondary.main} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          px: 2,
          pt: 2,
          pb: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsDialogOpen(true)}
        >
          <Box
            sx={{
              width: 110,
              height: 180,
              borderRadius: '24px',
              border: `1px dashed ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: 'secondary.main' }
            }}
          >
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'background.paper',
              mb: 1.5,
              boxShadow: '0 8px 16px rgba(212, 175, 55, 0.4)',
              zIndex: 1
            }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 200 }}>+</Typography>
            </Box>
            <Typography sx={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', color: 'text.primary', zIndex: 1 }}>ADD RITUAL</Typography>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: `radial-gradient(circle, ${theme.palette.secondary.main}10 0%, transparent 70%)`,
              pointerEvents: 'none'
            }} />
          </Box>
        </motion.div>

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 110, height: 180 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        <AnimatePresence>
          {!isLoading && stories.map((story: Story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openStory(story)}
            >
              <Box
                sx={{
                  width: 110,
                  height: 180,
                  borderRadius: '24px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  '&::after': story.images.length > 1 ? {
                    content: '""',
                    position: 'absolute',
                    top: 4,
                    right: -4,
                    width: '100%',
                    height: '100%',
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: '24px',
                    zIndex: -1,
                    transform: 'rotate(2deg)',
                  } : {},
                  '&::before': story.images.length > 2 ? {
                    content: '""',
                    position: 'absolute',
                    top: 8,
                    right: -8,
                    width: '100%',
                    height: '100%',
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderRadius: '24px',
                    zIndex: -2,
                    transform: 'rotate(4deg)',
                  } : {}
                }}
              >
                <Box
                  component="img"
                  src={story.images[0]}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
                {story.images.length > 1 && (
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                    zIndex: 2
                  }}>
                    {story.images.map((_, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          flex: 1,
                          height: 2,
                          bgcolor: idx === 0 ? 'white' : 'rgba(255,255,255,0.4)',
                          borderRadius: '1px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)'
                }} />
                <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                  <Avatar
                    src={story.avatar}
                    sx={{
                      width: 28,
                      height: 28,
                      border: `2px solid ${theme.palette.secondary.main}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>
                {(story.userId === user?.id || story.userId === user?.sub || story.userId === 'current-user') && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteStory(e, story.id)}
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 8,
                      zIndex: 3,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)',
                      color: '#ff4444',
                      p: 0.5,
                      '&:hover': { bgcolor: 'rgba(255,68,68,0.2)' }
                    }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
                <Box sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  p: 1,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <Typography component="span" sx={{ color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.2 }}>
                    {renderStoryTitleWithMentions(story.title, { color: theme.palette.secondary.main }, (username) => console.log(`Mention clicked in story: ${username}`))}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '8px', fontWeight: 600, mt: 0.5 }}>
                    {story.name}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '28px',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, pb: 1 }}>
          <Typography component="span" sx={{ fontWeight: 900, fontSize: '14px', letterSpacing: '0.1em', color: 'text.secondary' }}>
            NEW RITUAL
          </Typography>
          <IconButton onClick={() => setIsDialogOpen(false)} size="small" sx={{ opacity: 0.5 }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar
                src={user?.avatar}
                sx={{ width: 40, height: 40, border: `1px solid ${theme.palette.divider}` }}
              />
              <Box ref={inputContainerRef} sx={{ flex: 1, position: 'relative' }}>
                <MentionSuggestionDropdown
                  users={suggestions}
                  open={showSuggestions}
                  selectedIndex={selectedIndex}
                  onSelect={handleSelectMention}
                  onClose={() => setShowSuggestions(false)}
                  anchorRef={inputContainerRef}
                  position="below"
                />
                <Typography sx={{ fontSize: '12px', fontWeight: 800, mb: 0.5 }}>{user?.name || 'Glow Member'}</Typography>
                <InputBase
                  placeholder="What's your ritual today?"
                  fullWidth
                  multiline
                  rows={2}
                  inputRef={storyInputRef}
                  value={newStory.title}
                  onChange={handleTitleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && showSuggestions && suggestions.length > 0) {
                      e.preventDefault();
                      handleSelectMention(suggestions[selectedIndex]);
                      return;
                    }
                    if (!showSuggestions || suggestions.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
                    }
                  }}
                  sx={{
                    fontSize: '15px',
                    fontWeight: 300,
                    color: 'text.primary',
                    lineHeight: 1.4,
                    '& .MuiInputBase-input::placeholder': { opacity: 0.4 }
                  }}
                />
              </Box>
            </Stack>
            <Box sx={{ position: 'relative', minHeight: 140 }}>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={
                  newStory.images.length > 0
                    ? { display: 'none' }
                    : {
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        width: '100%', minHeight: 140,
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 1,
                      }
                }
              />
              {newStory.images.length > 0 ? (
                <Box sx={{ position: 'relative' }}>
                  <ImageList
                    sx={{
                      width: '100%',
                      m: 0,
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                    cols={newStory.images.length === 1 ? 1 : 2}
                    rowHeight={newStory.images.length === 1 ? 300 : 150}
                    gap={4}
                  >
                    {newStory.images.map((img, index) => (
                      <ImageListItem key={index} sx={{ position: 'relative' }}>
                        <img src={img} alt={`Preview ${index}`} loading="lazy" style={{ height: '100%', objectFit: 'cover' }} />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            backdropFilter: 'blur(4px)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
                  <Button
                    startIcon={<Plus size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: 'black',
                      borderRadius: '100px',
                      fontSize: '10px',
                      fontWeight: 800,
                      px: 2,
                      backdropFilter: 'blur(10px)',
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    ADD MORE
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 140,
                    borderRadius: '24px',
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px dashed ${theme.palette.divider}`,
                    cursor: isProcessingImages ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none',
                    '&:hover': isProcessingImages ? {} : {
                      borderColor: 'secondary.main',
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  {isProcessingImages ? (
                    <CircularProgress size={28} sx={{ color: 'secondary.main', mb: 1.5 }} />
                  ) : (
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mb: 1.5,
                      boxShadow: '0 8px 20px rgba(212, 175, 55, 0.2)'
                    }}>
                      <Camera size={20} />
                    </Box>
                  )}
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.05em' }}>
                    {isProcessingImages ? 'PROCESSING...' : 'ATTACH VISUALS'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <Divider sx={{ opacity: 0.3, mx: 2 }} />
        <DialogActions sx={{ p: 2, px: 3, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ color: 'secondary.main' }}>
              <ImageIcon size={20} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary', opacity: 0.5 }}>
              <Sparkles size={20} />
            </IconButton>
          </Stack>
          <Button
            variant="contained"
            onClick={handleAddStory}
            disabled={!newStory.title || newStory.images.length === 0 || isSubmitting || isProcessingImages}
            endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
            sx={{
              borderRadius: '100px',
              px: 4,
              py: 1,
              fontWeight: 900,
              fontSize: '12px',
              bgcolor: 'text.primary',
              color: 'background.paper',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: 'text.secondary' },
              '&.Mui-disabled': { opacity: 0.3 }
            }}
          >
            POST
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen
        open={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        PaperProps={{
          sx: {
            bgcolor: 'black',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, p: 2, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedStory?.images.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  height: 2,
                  bgcolor: idx <= currentImageIndex ? 'white' : 'rgba(255,255,255,0.3)',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={selectedStory?.avatar} sx={{ width: 32, height: 32, border: '1px solid white' }} />
              <Box>
                <Typography sx={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>{selectedStory?.name}</Typography>
                <Typography component="span" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: 600 }}>
                  {selectedStory && renderStoryTitleWithMentions(selectedStory.title, { color: theme.palette.secondary.main }, (username) => console.log(`Mention clicked in story viewer: ${username}`))}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setSelectedStory(null)} sx={{ color: 'white' }}>
              <X size={24} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
          <Box
            sx={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', zIndex: 5, cursor: 'pointer' }}
            onClick={prevImage}
          />
          <Box
            sx={{ position: 'absolute', top: 0, right: 0, width: '70%', height: '100%', zIndex: 5, cursor: 'pointer' }}
            onClick={nextImage}
          />
          <AnimatePresence mode="wait">
            <motion.img
              key={`${selectedStory?.id}-${currentImageIndex}`}
              src={selectedStory?.images[currentImageIndex]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </AnimatePresence>
        </Box>
      </Dialog>

      <Dialog
        open={!!storyToDelete}
        onClose={() => setStoryToDelete(null)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            maxWidth: '320px'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(255,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff4444',
            mx: 'auto',
            mb: 2
          }}>
            <Trash2 size={28} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '18px' }}>Remove Ritual?</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
            This action cannot be undone. Your ritual will be permanently removed from the feed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={confirmDelete}
            sx={{
              bgcolor: '#ff4444',
              color: 'white',
              borderRadius: '100px',
              py: 1.2,
              fontWeight: 800,
              '&:hover': { bgcolor: '#cc0000' }
            }}
          >
            DELETE RITUAL
          </Button>
          <Button
            fullWidth
            onClick={() => setStoryToDelete(null)}
            sx={{
              color: 'text.secondary',
              borderRadius: '100px',
              py: 1.2,
              fontWeight: 700
            }}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity="error" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
