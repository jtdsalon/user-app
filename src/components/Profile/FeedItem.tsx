import React, { useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Trash2,
  Edit3,
} from 'lucide-react';
import { FeedPost, UserProfile } from './types';
import { getFullImageUrl } from '@/lib/util/imageUrl';

interface FeedItemProps {
  post: FeedPost;
  currentUser: UserProfile;
  onUpdate: (post: FeedPost) => void;
  onDelete: (id: string) => void;
  onEdit: (post: FeedPost) => void;
  onViewSalon?: (id: string) => void;
}

const FeedItem: React.FC<FeedItemProps> = ({
  post,
  currentUser,
  onUpdate,
  onDelete,
  onEdit,
  onViewSalon,
}) => {
  const theme = useTheme();
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onUpdate({ ...post, liked: !liked, likes: liked ? likeCount - 1 : likeCount + 1 });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(post);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(post.id);
    handleMenuClose();
  };

  const isOwnPost = post.userId === currentUser.id;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: '16px',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, pb: 1.5 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
          <Avatar src={post.userAvatar} sx={{ width: 40, height: 40 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>
              {post.userName}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 500 }}>
              {post.userHandle}
            </Typography>
          </Box>
        </Stack>
        {isOwnPost && (
          <>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertical size={16} color={theme.palette.text.secondary} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleEdit} sx={{ fontSize: '12px' }}>
                <Edit3 size={14} style={{ marginRight: 8 }} /> Edit
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ fontSize: '12px', color: '#ef4444' }}>
                <Trash2 size={14} style={{ marginRight: 8 }} /> Delete
              </MenuItem>
            </Menu>
          </>
        )}
      </Stack>

      {/* Image */}
      <Box
        component="img"
        src={getFullImageUrl(post.image) || post.image}
        sx={{
          width: '100%',
          height: 'auto',
          display: 'block',
          aspectRatio: '1/1',
          objectFit: 'cover',
        }}
      />

      {/* Actions */}
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ p: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <IconButton
          size="small"
          onClick={handleLike}
          sx={{
            color: liked ? '#ef4444' : 'text.secondary',
            '&:hover': { color: '#ef4444' },
          }}
        >
          <Heart size={18} fill={liked ? '#ef4444' : 'none'} />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <MessageCircle size={18} />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <Share2 size={18} />
        </IconButton>
      </Stack>

      {/* Stats and Caption */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
          <Box sx={{ cursor: 'pointer' }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: 'text.primary' }}>
              {likeCount} likes
            </Typography>
          </Box>
          <Box sx={{ cursor: 'pointer' }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: 'text.primary' }}>
              {post.comments} comments
            </Typography>
          </Box>
        </Stack>

        <Typography sx={{ fontSize: '13px', color: 'text.primary', lineHeight: 1.6, mb: 1 }}>
          <Typography
            component="span"
            sx={{ fontWeight: 700, mr: 0.5, cursor: 'pointer', color: 'primary.main' }}
          >
            {post.userName}
          </Typography>
          {post.caption}
        </Typography>

        <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 500 }}>
          {new Date(post.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Typography>
      </Box>
    </Paper>
  );
};

export default FeedItem;
