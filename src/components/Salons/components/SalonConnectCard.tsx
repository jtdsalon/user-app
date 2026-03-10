import React from 'react';
import { Paper, Stack, Typography, IconButton } from '@mui/material';
import { Instagram, Facebook, Youtube, Share2 } from 'lucide-react';
import type { Salon } from '@/components/Home/types';

interface SalonConnectCardProps {
  salon: Salon;
  openExternalLink: (url?: string | null) => void;
  onOpenShare: () => void;
}

/**
 * SalonConnectCard renders social and profile share actions for a salon.
 */
export const SalonConnectCard: React.FC<SalonConnectCardProps> = ({
  salon,
  openExternalLink,
  onOpenShare,
}) => {
  return (
    <Paper
      elevation={0}
      sx={theme => ({
        p: 4,
        borderRadius: '32px',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'action.hover',
      })}
    >
      <Typography
        variant="overline"
        sx={{
          fontWeight: 900,
          color: 'text.secondary',
          mb: 3,
          display: 'block',
          letterSpacing: '0.15em',
        }}
      >
        CONNECT & SHARE
      </Typography>
      <Stack direction="row" spacing={2}>
        <IconButton
          onClick={() => openExternalLink(salon.socials?.instagram)}
          disabled={!salon.socials?.instagram}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            color: '#E1306C',
            transition: 'all 0.3s',
            opacity: salon.socials?.instagram ? 1 : 0.4,
            '&:hover': {
              transform: salon.socials?.instagram ? 'scale(1.1)' : 'none',
            },
          }}
        >
          <Instagram size={20} />
        </IconButton>
        <IconButton
          onClick={() => openExternalLink(salon.socials?.facebook)}
          disabled={!salon.socials?.facebook}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            color: '#4267B2',
            transition: 'all 0.3s',
            opacity: salon.socials?.facebook ? 1 : 0.4,
            '&:hover': {
              transform: salon.socials?.facebook ? 'scale(1.1)' : 'none',
            },
          }}
        >
          <Facebook size={20} />
        </IconButton>
        <IconButton
          onClick={() => openExternalLink(salon.socials?.website)}
          disabled={!salon.socials?.website}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            color: '#FF0000',
            transition: 'all 0.3s',
            opacity: salon.socials?.website ? 1 : 0.4,
            '&:hover': {
              transform: salon.socials?.website ? 'scale(1.1)' : 'none',
            },
          }}
        >
          <Youtube size={20} />
        </IconButton>
        <IconButton
          onClick={onOpenShare}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            color: 'text.primary',
            transition: 'all 0.3s',
            '&:hover': { transform: 'scale(1.1)' },
          }}
        >
          <Share2 size={20} />
        </IconButton>
      </Stack>
    </Paper>
  );
};

