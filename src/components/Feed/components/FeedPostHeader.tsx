import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  useTheme,
} from '@mui/material';
import { MoreVertical, Pencil, Trash, Share2, BadgeCheck } from 'lucide-react';
import { FeedPost } from '../types';
import { getFeedStrings } from '../properties';
import { getFullImageUrl } from '@/lib/util/imageUrl';

interface FeedPostHeaderProps {
  post: FeedPost;
  isFavourited: boolean;
  isOwnPost: boolean;
  onHeaderClick: () => void;
  onToggleFollow: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRepost: () => void;
}

export const FeedPostHeader: React.FC<FeedPostHeaderProps> = ({
  post,
  isFavourited,
  isOwnPost,
  onHeaderClick,
  onToggleFollow,
  onEdit,
  onDelete,
  onRepost,
}) => {
  const theme = useTheme();
  const s = getFeedStrings();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isSalonOrPage = post.userType === 'salon' || post.userType === 'page';

  return (
    <CardHeader
      avatar={
        <Avatar
          src={getFullImageUrl(post.userAvatar) || post.userAvatar}
          onClick={onHeaderClick}
          sx={{
            width: 38,
            height: 38,
            minWidth: 38,
            minHeight: 38,
            flexShrink: 0,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
          }}
        />
      }
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            onClick={onHeaderClick}
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: '13px',
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              '&:hover': { color: 'secondary.main' },
            }}
          >
            {post.userName}
          </Typography>
          {isSalonOrPage && (
            <Box sx={{ display: 'flex', color: 'secondary.main' }}>
              <BadgeCheck size={14} fill="currentColor" color={theme.palette.background.default} />
            </Box>
          )}

          {!isOwnPost && (
            <Typography
              onClick={onToggleFollow}
              sx={{
                ml: 2,
                fontSize: '9px',
                fontWeight: 900,
                color: isFavourited ? 'text.secondary' : 'secondary.main',
                cursor: 'pointer',
                letterSpacing: '0.12em',
                transition: 'all 0.2s',
                '&:hover': { opacity: 0.7 },
              }}
            >
              {isFavourited ? s.postHeader.favourite : s.postHeader.public}
            </Typography>
          )}
        </Stack>
      }
      subheader={
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '10px',
            fontWeight: 600,
            opacity: 0.6,
            letterSpacing: '0.05em',
          }}
        >
          {post.timeAgo.toUpperCase()}
        </Typography>
      }
      action={
        <>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVertical size={16} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              },
            }}
          >
            {isOwnPost && (
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  onEdit();
                }}
                sx={{ fontSize: '12px', gap: 1.5, fontWeight: 700 }}
              >
                <Pencil size={14} color="inherit" /> {s.postHeader.editMasterpiece}
              </MenuItem>
            )}
            {isOwnPost && (
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  onDelete();
                }}
                sx={{ fontSize: '12px', color: '#ef4444', gap: 1.5, fontWeight: 700 }}
              >
                <Trash size={14} /> {s.postHeader.removeEntry}
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onRepost();
              }}
              sx={{ fontSize: '12px', gap: 1.5, fontWeight: 700 }}
            >
              <Share2 size={14} /> {s.postHeader.repostAesthetic}
            </MenuItem>
          </Menu>
        </>
      }
      sx={{ px: 0, py: 1.5 }}
    />
  );
};
