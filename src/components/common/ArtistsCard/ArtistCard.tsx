
import React from 'react';
import {
  Card,
  Typography,
  Box,
  Button,
  Avatar,
  Stack,
  IconButton,
  keyframes,
  useTheme,
  Skeleton
} from '@mui/material';
import {
  Check,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Star
} from 'lucide-react';
import { Artist } from './types';

interface ArtistCardProps {
  artist: Artist;
  onBook: () => void;
}

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 1; }
  70% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.95); opacity: 1; }
`;

export const ArtistCardSkeleton: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: '32px',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        p: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton animation="wave" variant="text" width={40} height={20} />
        <Skeleton animation="wave" variant="text" width={40} height={20} />
      </Box>
      <Skeleton
        animation="wave"
        variant="circular"
        width={110}
        height={110}
        sx={{ mb: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
      />
      <Box sx={{ mb: 3, width: '100%' }}>
        <Skeleton animation="wave" variant="text" width="60%" sx={{ mx: 'auto' }} height={28} />
        <Skeleton animation="wave" variant="text" width="40%" sx={{ mx: 'auto' }} height={18} />
      </Box>
      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 3 }}>
        <Skeleton animation="wave" variant="rectangular" width={64} height={28} sx={{ borderRadius: '10px' }} />
        <Skeleton animation="wave" variant="rectangular" width={64} height={28} sx={{ borderRadius: '10px' }} />
      </Stack>
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={48}
        sx={{ borderRadius: '100px', mb: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5}>
          <Skeleton animation="wave" variant="circular" width={24} height={24} />
          <Skeleton animation="wave" variant="circular" width={24} height={24} />
          <Skeleton animation="wave" variant="circular" width={24} height={24} />
        </Stack>
        <Skeleton animation="wave" variant="circular" width={24} height={24} />
      </Box>
    </Card>
  );
};

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onBook }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const servicesArr = artist.services || [];
  const displayedServices = servicesArr.slice(0, 3);
  const remainingServices = servicesArr.length > 3 ? servicesArr.length - 3 : 0;

  const activeClients = artist.activeClients || 0;
  const rating = artist.rating || 0;
  const image = artist.image || artist.avatar || '';
  const isOnline = artist.isOnline ?? true;
  const isVerified = artist.isVerified ?? true;
  const location = artist.location || 'NYC';
  const clientsCount = artist.clientsCount || 0;
  const hours = artist.hours || '10AM - 6PM';
  const experience = artist.experience || 'Master Artisan';
  const nextAvailable = artist.nextAvailable || 'TBD';

  return (
    // Static wrapper to capture hover without jitter
    <Box
      sx={{
        width: '100%',
        p: 1.5,
        position: 'relative',
        '&:hover .visual-artist-card': {
          transform: 'translateY(-12px)',
          boxShadow: isDarkMode ? '0 40px 80px rgba(0,0,0,0.7)' : '0 25px 50px rgba(15, 23, 42, 0.1)',
          borderColor: theme.palette.secondary.main,
        }
      }}
    >
      <Card
        className="visual-artist-card"
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: '32px',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          position: 'relative',
          p: '28px 24px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
          willChange: 'transform, box-shadow',
          '&:hover .artist-avatar': { transform: 'scale(1.15)' }
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Stack direction="column" alignItems="flex-start">
            <Typography sx={{ fontSize: '11px', fontWeight: 900, color: 'text.primary', lineHeight: 1 }}>{activeClients}+</Typography>
            <Typography sx={{ fontSize: '7px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.12em', opacity: 0.6 }}>ACTIVE JOURNEYS</Typography>
          </Stack>

          <Stack direction="column" alignItems="flex-end">
            <Stack direction="row" spacing={0.3} alignItems="center">
              <Star size={10} color={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
              <Typography sx={{ fontSize: '11px', fontWeight: 900, color: 'secondary.main', lineHeight: 1 }}>{rating}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '7px', fontWeight: 900, color: 'secondary.main', letterSpacing: '0.12em', opacity: 0.8 }}>ARTISAN SCORE</Typography>
          </Stack>
        </Box>

        <Box sx={{ position: 'relative', mb: 3 }}>
          <Avatar
            className="artist-avatar"
            src={image}
            sx={{
              width: 110,
              height: 110,
              boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.05)',
              border: `4px solid ${theme.palette.background.paper}`,
              transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
          />
          {isOnline && (
            <Box sx={{
              position: 'absolute', bottom: 10, right: 10, width: 14, height: 14,
              bgcolor: '#22C55E', border: `3px solid ${theme.palette.background.paper}`, borderRadius: '50%',
              animation: `${pulse} 2s infinite ease-in-out`
            }} />
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.2rem', letterSpacing: '-0.01em' }}>{artist.name}</Typography>
            {isVerified && <Check size={14} color={theme.palette.secondary.main} strokeWidth={4} />}
          </Stack>
          <Typography sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            {location.toUpperCase()}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            • {clientsCount} CLIENTS
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <Box sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'action.hover', px: 2, py: 0.8, borderRadius: '10px', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'secondary.main', color: 'primary.main' } }}>
            <Typography sx={{ fontSize: '9px', fontWeight: 900, color: 'inherit', letterSpacing: '0.08em' }}>{hours}</Typography>
          </Box>
          <Box sx={{ border: `1px solid ${theme.palette.divider}`, px: 2, py: 0.8, borderRadius: '10px', transition: 'all 0.3s ease', '&:hover': { borderColor: 'secondary.main', color: 'secondary.main' } }}>
            <Typography sx={{ fontSize: '9px', fontWeight: 900, color: 'inherit', letterSpacing: '0.08em' }}>{experience.toUpperCase()}</Typography>
          </Box>
        </Stack>

        <Typography sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 700, mb: 3 }}>
          Next Archive Entry: <Box component="span" sx={{ color: 'secondary.main', fontWeight: 900 }}>{nextAvailable}</Box>
        </Typography>

        <Box sx={{ width: '100%', height: '1px', bgcolor: theme.palette.divider, mb: 3, opacity: 0.5 }} />

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack direction="row" spacing={-1.5}>
              {displayedServices.map((s: any, idx) => (
                <Avatar
                  key={idx}
                  sx={{
                    width: 32, height: 32, bgcolor: s.color,
                    color: '#0F172A', fontSize: '11px', fontWeight: 900,
                    border: `2px solid ${theme.palette.background.paper}`,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', zIndex: 10 }
                  }}
                >
                  {s.label}
                </Avatar>
              ))}
            </Stack>
            {remainingServices > 0 && (
              <Typography sx={{ fontSize: '11px', fontWeight: 900, color: 'text.secondary' }}>+{remainingServices}</Typography>
            )}
          </Stack>

          <Button
            variant="contained"
            onClick={onBook}
            sx={{
              borderRadius: '100px', px: 3, py: 1,
              bgcolor: 'text.primary', color: 'background.paper',
              fontWeight: 900, fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.15em',
              boxShadow: 'none',
              transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              '&:hover': { bgcolor: 'text.secondary', transform: 'scale(1.05)' }
            }}
          >
            Book Ritual
          </Button>
        </Box>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2.5}>
            <Instagram size={16} color={theme.palette.text.secondary} style={{ opacity: 0.7, cursor: 'pointer', transition: 'all 0.3s' }} />
            <Twitter size={16} color={theme.palette.text.secondary} style={{ opacity: 0.7, cursor: 'pointer', transition: 'all 0.3s' }} />
            <Facebook size={16} color={theme.palette.text.secondary} style={{ opacity: 0.7, cursor: 'pointer', transition: 'all 0.3s' }} />
          </Stack>
          <MapPin size={20} color={theme.palette.primary.main} />
        </Box>
      </Card>
    </Box>
  );
};

export default React.memo(ArtistCard);
