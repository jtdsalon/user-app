import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { X, UserPlus, Check, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLayout } from '../common/layouts/layoutContext';
import { getPostLikersApi, getPostCommentLikersApi, type PostLiker } from '@/services/api/feedService';
import { getFullImageUrl } from '@/lib/util/imageUrl';

interface LikesDialogProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  /** When provided, fetches comment likers instead of post likers */
  commentId?: string | null;
  currentUserId?: string | null;
}

export const LikesDialog: React.FC<LikesDialogProps> = ({ open, onClose, postId, commentId, currentUserId }) => {
  const { toggleFollowedUser, followedUsers } = useLayout();
  const [likers, setLikers] = useState<PostLiker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !postId) {
      setLikers([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const fetchApi = commentId
      ? getPostCommentLikersApi(postId, commentId)
      : getPostLikersApi(postId);
    fetchApi
      .then((res) => {
        const data = res?.data?.data ?? res?.data;
        setLikers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load glows');
        setLikers([]);
      })
      .finally(() => setLoading(false));
  }, [open, postId, commentId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '28px',
          maxHeight: '70vh',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle component="div" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
          Glows
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <List sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={32} />
          </List>
        ) : error ? (
          <List sx={{ py: 4, px: 2 }}>
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          </List>
        ) : likers.length === 0 ? (
          <List sx={{ py: 4, px: 2 }}>
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              No glows yet
            </Typography>
          </List>
        ) : (
          <List sx={{ py: 1 }}>
            <AnimatePresence>
              {likers.map((user, index) => {
                const isFavourite = followedUsers.includes(user.id);
                const isCurrentUser = currentUserId && user.id === currentUserId;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      sx={{
                        px: 2,
                        py: 1.5,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      secondaryAction={!isCurrentUser ? (
                        <Button
                          size="small"
                          variant={isFavourite ? 'outlined' : 'contained'}
                          onClick={() => toggleFollowedUser(user.id)}
                          startIcon={isFavourite ? <Check size={14} /> : <UserPlus size={14} />}
                          sx={{
                            borderRadius: '100px',
                            textTransform: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            px: 2,
                            minWidth: '90px',
                            bgcolor: isFavourite ? 'transparent' : 'text.primary',
                            color: isFavourite ? 'text.primary' : 'background.paper',
                            borderColor: 'text.primary',
                            '&:hover': {
                              bgcolor: isFavourite ? 'action.hover' : 'text.secondary',
                              borderColor: 'text.primary',
                            },
                          }}
                        >
                          {isFavourite ? 'FAVORITES' : 'PUBLIC'}
                        </Button>
                      ) : undefined}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={getFullImageUrl(user.avatar) || user.avatar || undefined}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: !(getFullImageUrl(user.avatar) || user.avatar) ? 'action.hover' : undefined,
                          }}
                        >
                          {!(getFullImageUrl(user.avatar) || user.avatar) && <User size={22} strokeWidth={1.5} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 800, fontSize: '14px' }}>
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                            {user.handle}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
