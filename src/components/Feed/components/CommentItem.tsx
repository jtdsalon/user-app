import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Sparkles, Pencil, Trash, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFeedStrings } from '../properties';
import { Comment } from '../types';
import { ExpandableText } from './ExpandableText';
import { getFullImageUrl } from '@/lib/util/imageUrl';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onSaveEdit: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  /** When comment has likes > 0, clicking likes count opens this dialog */
  onViewLikes?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  isEditing,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onLike,
  onDelete,
  onViewLikes,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const s = getFeedStrings();
  const isOwnComment = currentUserId && comment.userId === currentUserId;

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Avatar
        src={getFullImageUrl(comment.userAvatar) || comment.userAvatar}
        onClick={() => navigate(`/profile/${comment.userId}`)}
        sx={{
          width: 32,
          height: 32,
          border: `1px solid ${theme.palette.divider}`,
          cursor: 'pointer',
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              onClick={() => navigate(`/profile/${comment.userId}`)}
              sx={{
                fontWeight: 800,
                fontSize: '12px',
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': { color: 'secondary.main' },
              }}
            >
              {comment.userName}
            </Typography>
            <Typography
              sx={{
                fontSize: '9px',
                color: 'text.secondary',
                fontWeight: 600,
                opacity: 0.5,
              }}
            >
              {comment.timeAgo.toUpperCase()}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 0.5 }}>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                onClick={() => onLike(comment.id)}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:active': { transform: 'scale(1.2)' },
                }}
              >
                <IconButton
                size="small"
                sx={{
                  p: 0,
                  color: comment.isLiked ? 'secondary.main' : 'text.secondary',
                }}
              >
                <Sparkles
                  size={12}
                  fill={comment.isLiked ? theme.palette.secondary.main : 'none'}
                />
              </IconButton>
              {comment.likes > 0 && (
                <Typography
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewLikes?.(comment.id);
                  }}
                  sx={{
                    fontSize: '9px',
                    fontWeight: 900,
                    color: comment.isLiked ? 'secondary.main' : 'text.secondary',
                    cursor: onViewLikes ? 'pointer' : 'default',
                    '&:hover': onViewLikes ? { textDecoration: 'underline' } : {},
                  }}
                >
                  {comment.likes}
                </Typography>
              )}
              </Stack>
            </Stack>

            {isOwnComment && (
              <Stack direction="row" spacing={0.5}>
                {isEditing ? (
                  <Tooltip title={s.comments.cancelEdit}>
                    <IconButton
                      size="small"
                      onClick={onCancelEdit}
                      sx={{ p: 0.5, color: 'secondary.main' }}
                    >
                      <X size={12} strokeWidth={3} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => onStartEdit(comment)}
                    sx={{
                      p: 0.5,
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    <Pencil size={12} />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => onDelete(comment.id)}
                  sx={{
                    p: 0.5,
                    color: 'text.secondary',
                    '&:hover': { color: '#ef4444' },
                  }}
                >
                  <Trash size={12} />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Stack>

        {isEditing ? (
          <Box sx={{ position: 'relative', pr: 4 }}>
            <InputBase
              autoFocus
              value={editingText}
              onChange={(e) => onEditingTextChange(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSaveEdit(comment.id);
                }
              }}
              fullWidth
              sx={{
                fontSize: '12px',
                fontWeight: 400,
                color: 'text.primary',
                borderBottom: `2px solid ${theme.palette.secondary.main}`,
                pb: 0.2,
              }}
            />
            <IconButton
              size="small"
              onClick={() => onSaveEdit(comment.id)}
              disabled={!editingText.trim()}
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                color: 'secondary.main',
                p: 0.2,
                '&.Mui-disabled': { opacity: 0.5 },
              }}
            >
              <Send size={14} strokeWidth={2.5} />
            </IconButton>
          </Box>
        ) : (
          <ExpandableText text={comment.text} limit={80} isComment />
        )}
      </Box>
    </Box>
  );
};
