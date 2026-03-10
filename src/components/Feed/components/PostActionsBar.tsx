import React from 'react';
import { Stack, IconButton, Typography } from '@mui/material';
import { Share2, Bookmark } from 'lucide-react';
import { GlowsButton } from './GlowsButton';
import { CurationsButton } from './CurationsButton';
import { getFeedStrings } from '../properties';

interface PostActionsBarProps {
  likes: number;
  isLiked: boolean;
  onToggleGlow: () => void;
  onViewLikes?: () => void;
  commentsCount: number;
  showComments: boolean;
  onToggleComments: () => void;
  repostsCount?: number;
  onRepost: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const PostActionsBar: React.FC<PostActionsBarProps> = ({
  likes,
  isLiked,
  onToggleGlow,
  onViewLikes,
  commentsCount,
  showComments,
  onToggleComments,
  repostsCount = 0,
  onRepost,
  isSaved,
  onToggleSave,
}) => {
  const s = getFeedStrings();

  return (
    <Stack direction="row" sx={{ width: '100%', px: 0, pt: 1, pb: 0, justifyContent: 'space-between' }}>
      <Stack direction="row" spacing={3}>
        <GlowsButton count={likes} isLiked={isLiked} onToggle={onToggleGlow} onViewLikes={onViewLikes} />
        <CurationsButton
          count={commentsCount}
          isActive={showComments}
          onClick={onToggleComments}
        />
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="small"
            onClick={onRepost}
            sx={{ p: 0.5, color: 'text.secondary', opacity: 0.7 }}
          >
            <Share2 size={18} strokeWidth={1.5} />
          </IconButton>
          <Stack direction="column">
            <Typography sx={{ fontSize: '11px', fontWeight: 900, color: 'text.primary', lineHeight: 1 }}>
              {repostsCount}
            </Typography>
            <Typography sx={{ fontSize: '8px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.12em', opacity: 0.8 }}>
              {s.actions.reposts}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <IconButton
        size="small"
        onClick={onToggleSave}
        sx={{ ml: 'auto', p: 0.5, color: isSaved ? 'secondary.main' : 'text.secondary', opacity: isSaved ? 1 : 0.7 }}
      >
        <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.5} />
      </IconButton>
    </Stack>
  );
};
