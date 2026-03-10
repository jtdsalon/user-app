import React from 'react';
import { Stack, IconButton, Typography } from '@mui/material';
import { getFeedStrings } from '../properties';
import { MessageCircle } from 'lucide-react';

interface CurationsButtonProps {
  count: number;
  isActive: boolean;
  onClick: () => void;
  label?: string;
}

export const CurationsButton: React.FC<CurationsButtonProps> = ({
  count,
  isActive,
  onClick,
  label,
}) => {
  const s = getFeedStrings();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <IconButton
        size="small"
        sx={{
          p: 0.5,
          color: isActive ? 'secondary.main' : 'text.secondary',
        }}
      >
        <MessageCircle
          size={22}
          fill={isActive ? 'rgba(212, 175, 55, 0.1)' : 'none'}
          strokeWidth={1.5}
        />
      </IconButton>
      <Stack direction="column">
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 900,
            color: isActive ? 'secondary.main' : 'text.primary',
            lineHeight: 1,
          }}
        >
          {count}
        </Typography>
        <Typography
          sx={{
            fontSize: '8px',
            fontWeight: 900,
            color: isActive ? 'secondary.main' : 'text.secondary',
            letterSpacing: '0.12em',
            opacity: 0.8,
          }}
        >
          {label ?? s.actions.curations}
        </Typography>
      </Stack>
    </Stack>
  );
};
