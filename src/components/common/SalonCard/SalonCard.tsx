import React from 'react';
import {
  Card,
  Typography,
  Box,
  Button,
  Avatar,
  Stack,
  Divider,
  keyframes,
  IconButton,
  AvatarGroup,
  useTheme,
  Skeleton
} from '@mui/material';
import {
  Check,
  MapPin,
  Facebook,
  Star,
  Heart,
  Instagram,
  Globe,
  Tag
} from 'lucide-react';
import { Salon } from './types';
import { formatLKR } from '@/lib/utils/currency';
import { AvatarWithFallback } from '../ImageWithFallback';

/**
 * Props for SalonCard.
 * @see SALON_CARD.md for full details shown and actions.
 */
interface SalonCardProps {
  salon: Salon;
  onBook: (salon: Salon) => void;
  onViewProfile?: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 1; }
  70% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.95); opacity: 1; }
`;

export const SalonCardSkeleton: React.FC = () => {
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
        p: 2.5,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Skeleton animation="wave" variant="text" width={40} height={20} />
        <Skeleton animation="wave" variant="text" width={40} height={20} />
      </Box>
      <Skeleton
        animation="wave"
        variant="circular"
        width={90}
        height={90}
        sx={{ mb: 1.5, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
      />
      <Box sx={{ mb: 1, width: '100%' }}>
        <Skeleton animation="wave" variant="text" width="70%" sx={{ mx: 'auto' }} height={28} />
        <Skeleton animation="wave" variant="text" width="40%" sx={{ mx: 'auto' }} height={18} />
      </Box>
      <Box sx={{ width: '100%', mb: 1.5, px: 0.5 }}>
        <Skeleton animation="wave" variant="text" width="40%" height={16} sx={{ mb: 1 }} />
        <Stack spacing={0.8}>
          {[1, 2, 3].map(i => (
            <Skeleton
              key={i}
              animation="wave"
              variant="rectangular"
              height={32}
              sx={{ borderRadius: '12px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            />
          ))}
        </Stack>
      </Box>
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={48}
        sx={{ borderRadius: '100px', mb: 1.5, bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1}>
          <Skeleton animation="wave" variant="circular" width={24} height={24} />
          <Skeleton animation="wave" variant="circular" width={24} height={24} />
        </Stack>
        <Skeleton animation="wave" variant="circular" width={24} height={24} />
      </Box>
    </Card>
  );
};

/**
 * Card showing salon summary: rating, clients, avatar, name, location, category,
 * top 3 services with prices, hours, service count, stylist avatars, and actions.
 * Actions: View profile (avatar/name/+N more), Book Now, map link, social links.
 * @see SALON_CARD.md for full documentation.
 */
const SalonCard: React.FC<SalonCardProps> = ({ salon, onBook, onViewProfile, isFavorite, onToggleFavorite }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isOnline = salon.status === 'online';

  const s = salon as any;
  const servicesArr = salon.fullServices || s.services || [];
  const ritualPreview = (servicesArr || []).slice(0, 3);
  const remainingRituals = (servicesArr || []).length > 3 ? (servicesArr || []).length - 3 : 0;

  const stylistsArr = salon.stylists || s.staff || [];
  const rating = salon.rating || s.average_rating || s.averageRating || 0;
  const locationText = salon.location || s.address || '';
  const categoryText = salon.category || s.salonCategory || '';
  const hoursText = salon.hours || `${s.openingTime || s.opening_time || 'N/A'} - ${s.closingTime || s.closing_time || ''}`;
  const servicesCount = salon.servicesCount || s.total_services || s.totalServices || (servicesArr || []).length;
  const nextAvailable = salon.nextAvailable || s.next_available || 'TBD';
  const profileImage = salon.image || s.profileImage || s.profile_image || s.image_url || salon.coverImage || s.cover_image_url || '';
  const clients = salon.clients || s.total_clients || s.totalClients || 0;
  const socials = (salon as any).socials || s.socials || {};
  const promotion = salon.offers?.[0] || s.offers?.[0];

  return (
    <Box
      sx={{
        height: '100%',
        p: 1.5,
        position: 'relative',
        transition: 'transform 0.4s ease',
        '&:hover .visual-card': {
          transform: 'translateY(-12px)',
          boxShadow: isDarkMode ? '0 40px 80px rgba(0,0,0,0.7)' : '0 25px 50px rgba(15, 23, 42, 0.12)',
          borderColor: theme.palette.secondary.main,
        }
      }}
    >
      <Card
        className="visual-card"
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: '32px',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          position: 'relative',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
          willChange: 'transform, box-shadow',
          '&:hover .main-avatar': { transform: 'scale(1.12)' }
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Stack direction="column" alignItems="flex-start">
            <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.primary', lineHeight: 1 }}>{Number(clients).toLocaleString()}+</Typography>
            <Typography sx={{ fontSize: '7px', fontWeight: 900, color: 'text.secondary', opacity: 0.6, letterSpacing: '0.12em' }}>HAPPY CLIENTS</Typography>
          </Stack>

          <Stack direction="column" alignItems="flex-end">
            <Stack direction="row" spacing={0.3} alignItems="center">
              <Star size={10} color={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
              <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'secondary.main', lineHeight: 1 }}>{rating}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '7px', fontWeight: 900, color: 'secondary.main', letterSpacing: '0.12em', opacity: 0.8 }}>RATING</Typography>
          </Stack>
        </Box>

        <Box sx={{ position: 'relative', mb: 1.5, cursor: 'pointer' }} onClick={onViewProfile}>
          {promotion && (
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                bgcolor: 'secondary.main',
                color: 'background.paper',
                borderRadius: '100px',
                px: 1.5,
                py: 0.5,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 0.2,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                animation: `${pulse} 2s infinite ease-in-out`
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Tag size={10} strokeWidth={3} />
                <Typography sx={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.05em' }}>
                  {(promotion.badge || promotion.title || '').toUpperCase()}
                </Typography>
              </Stack>
              {promotion.end_date && (() => {
                const end = new Date(promotion.end_date);
                const now = new Date();
                const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                if (daysLeft > 0 && daysLeft <= 7) {
                  return (
                    <Typography sx={{ fontSize: '7px', fontWeight: 700, opacity: 0.9 }}>
                      Ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </Typography>
                  );
                }
                return null;
              })()}
            </Box>
          )}
          <AvatarWithFallback
            className="main-avatar"
            src={profileImage}
            alt={salon.name}
            placeholderType="avatar"
            sx={{
              width: 90,
              height: 90,
              boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.05)',
              border: `4px solid ${theme.palette.background.paper}`,
              transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
          />
          {isOnline && (
            <Box sx={{
              position: 'absolute', bottom: 6, right: 6, width: 12, height: 12,
              bgcolor: '#22C55E', border: `2px solid ${theme.palette.background.paper}`, borderRadius: '50%',
              animation: `${pulse} 2s infinite ease-in-out`
            }} />
          )}
        </Box>

        <Box sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 0.2 }}>
            <Typography
              variant="h6"
              onClick={onViewProfile}
              sx={{
                fontWeight: 800, color: 'text.primary', cursor: 'pointer', fontSize: '1.05rem',
                letterSpacing: '-0.01em',
                transition: 'color 0.3s ease',
                '&:hover': { color: 'secondary.main' }
              }}
            >
              {salon.name}
            </Typography>
            {salon.isVerified && <Check size={12} color={theme.palette.secondary.main} strokeWidth={4} />}
          </Stack>
          <Typography sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 600, letterSpacing: '0.02em' }}>
            {locationText.toUpperCase()}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 600, letterSpacing: '0.02em' }}>
          {locationText && categoryText ? '•' : ''} {categoryText.toUpperCase()}
          </Typography>
        </Box>

        <Box sx={{ width: '100%', mb: 1.5, textAlign: 'left', px: 0.5 }}>
          <Typography variant="overline" sx={{ fontSize: '8px', fontWeight: 900, color: 'secondary.main', letterSpacing: '0.12em', display: 'block', mb: 0.5, opacity: 0.8 }}>
            TOP SERVICES
          </Typography>
          <Stack spacing={0.5}>
            {ritualPreview.map((ritual, idx) => (
              <Box
                key={ritual.id || ritual.serviceId || `service-${idx}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 0.8,
                  borderRadius: '8px',
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'transparent'}`,
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(226, 194, 117, 0.12)' : 'rgba(212, 175, 55, 0.08)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.primary' }}>
                    {ritual.serviceName || ritual.name || 'Service Name'}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', opacity: 0.8 }}>
                  {typeof ritual.price === 'number' ? formatLKR(ritual.price) : (ritual.price || '-')}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9', px: 1.5, py: 0.5, borderRadius: '8px' }}>
            <Typography sx={{ fontSize: '8px', fontWeight: 900, color: 'text.primary', letterSpacing: '0.05em' }}>{hoursText}</Typography>
          </Box>
          <Box sx={{ border: `1px solid ${theme.palette.divider}`, px: 1.5, py: 0.5, borderRadius: '8px' }}>
            <Typography sx={{ fontSize: '8px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.05em' }}>{servicesCount} SERVICES</Typography>
          </Box>
        </Stack>

        {/* <Typography sx={{ color: 'text.secondary', fontSize: '9px', fontWeight: 700, mb: 1.5 }}>
          Next Available: <Box component="span" sx={{ color: 'secondary.main', fontWeight: 900 }}>{nextAvailable}</Box>
        </Typography> */}

        <Divider sx={{ width: '100%', mb: 1.5, opacity: 0.4 }} />

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AvatarGroup
              max={3}
              sx={{
                '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '10px', fontWeight: 900, border: `2px solid ${theme.palette.background.paper}` }
              }}
            >
              {stylistsArr.map(st => (
                <AvatarWithFallback key={st.id} src={st.image} alt={st.name} placeholderType="staff" sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
                  {st.initials || (st.name ? st.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '')}
                </AvatarWithFallback>
              ))}
            </AvatarGroup>
          </Stack>

          <Button
            variant="contained"
            onClick={() => onBook(salon)}
            sx={{
              borderRadius: '100px', px: 2.5, py: 0.8,
              bgcolor: 'text.primary',
              color: 'background.paper',
              fontWeight: 900, fontSize: '10px',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              boxShadow: 'none',
              transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              '&:hover': { bgcolor: 'text.secondary', transform: 'scale(1.05)' }
            }}
          >
            Book Now
          </Button>
        </Box>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5}>
            {socials.instagram != null && socials.instagram !== '' && (
              <Box component="a" href={socials.instagram.startsWith('http') ? socials.instagram : `https://instagram.com/${String(socials.instagram).replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                <Instagram size={14} />
              </Box>
            )}
            {socials.facebook != null && socials.facebook !== '' && (
              <Box component="a" href={socials.facebook.startsWith('http') ? socials.facebook : `https://facebook.com/${String(socials.facebook).replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                <Facebook size={14} />
              </Box>
            )}
            {socials.website != null && socials.website !== '' && (
              <Box component="a" href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                <Globe size={14} />
              </Box>
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {(locationText || (s.latitude != null && s.longitude != null)) && (
              <Box
                component="a"
                href={
                  s.latitude != null && s.longitude != null
                    ? `https://www.google.com/maps?q=${Number(s.latitude)},${Number(s.longitude)}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                <MapPin size={18} color={theme.palette.primary.main} />
              </Box>
            )}
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default React.memo(SalonCard);
