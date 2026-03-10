import React from 'react';
import { Stack, IconButton, Typography, Tooltip } from '@mui/material';
import { getFeedStrings } from '../properties';
import { Sparkles } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

interface GlowsButtonProps {
  count: number;
  isLiked: boolean;
  onToggle: () => void;
  onViewLikes?: () => void;
  label?: string;
}

export const GlowsButton: React.FC<GlowsButtonProps> = ({
  count,
  isLiked,
  onToggle,
  onViewLikes,
  label,
}) => {
  const theme = useTheme();
  const s = getFeedStrings();

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconButton
        size="small"
        onClick={onToggle}
        sx={{ p: 0.5, color: isLiked ? 'secondary.main' : 'text.secondary' }}
      >
        <Sparkles
          size={22}
          fill={isLiked ? theme.palette.secondary.main : 'none'}
          strokeWidth={1.5}
        />
      </IconButton>
      <Tooltip title="View Glows" arrow placement="top">
        <Stack
          direction="column"
          onClick={onViewLikes ?? onToggle}
          sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
        >
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 900,
              color: isLiked ? 'secondary.main' : 'text.primary',
              lineHeight: 1,
            }}
          >
            {count}
          </Typography>
          <Typography
            sx={{
              fontSize: '8px',
              fontWeight: 900,
              color: isLiked ? 'secondary.main' : 'text.secondary',
              letterSpacing: '0.12em',
              opacity: 0.8,
            }}
          >
            {label ?? s.actions.glows}
          </Typography>
        </Stack>
      </Tooltip>
    </Stack>
  );
};
