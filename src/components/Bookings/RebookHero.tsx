
import React from 'react';
import { Box, Typography, Button, Stack, Paper, Fade } from '@mui/material';
import { Sparkles, User, History } from 'lucide-react';
import { Salon } from './types';
import { AvatarWithFallback, ImageWithFallback } from '@/components/common/ImageWithFallback';

interface RebookHeroProps {
  salon: Salon & { coverImage?: string };
  onRebook: () => void;
  onViewProfile?: () => void;
}

const COLORS = {
  midnight: '#0F172A',
  gold: '#D4AF37',
  bone: '#F8FAFC',
};

const RebookHero: React.FC<RebookHeroProps> = ({ salon, onRebook, onViewProfile }) => {
  return (
    <Fade in timeout={1200}>
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: '32px', 
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1.5px solid',
          borderColor: 'divider',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
             borderColor: COLORS.gold,
             transform: 'translateY(-4px)'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          height: { md: 220 } 
        }}>
          {/* Visual Side - Reduced footprint */}
          <Box sx={{ 
            flex: 0.8, 
            position: 'relative',
            height: { xs: 120, md: 'auto' },
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <ImageWithFallback
              src={salon.coverImage || salon.image}
              placeholderType="cover"
              objectFit="cover"
              sx={{ 
                width: '100%', 
                height: '100%', 
                filter: 'brightness(0.9)'
              }}
            />
            {/* Gradient Overlay for integration */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, bottom: 0,
              background: {
                xs: 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%)',
                md: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
              },
              display: (theme) => theme.palette.mode === 'light' ? 'block' : 'none'
            }} />
             <Box sx={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, bottom: 0,
              background: {
                xs: 'linear-gradient(0deg, #0F172A 0%, rgba(15,23,42,0) 50%)',
                md: 'linear-gradient(90deg, rgba(15,23,42,0) 0%, #0F172A 100%)'
              },
              display: (theme) => theme.palette.mode === 'dark' ? 'block' : 'none'
            }} />
            
            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
               <Box sx={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: 1, 
                 bgcolor: 'rgba(15,23,42,0.6)', 
                 color: '#fff',
                 px: 1.5, py: 0.5, 
                 borderRadius: '100px',
                 backdropFilter: 'blur(8px)',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}>
                 <History size={10} />
                 <Typography sx={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em' }}>LAST VISITED</Typography>
               </Box>
            </Box>
          </Box>

          {/* Content Side - Condensed Feed Look */}
          <Box sx={{ 
            flex: 1.2, 
            p: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            position: 'relative'
          }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <AvatarWithFallback src={salon.image} alt={salon.name} placeholderType="avatar" sx={{ width: 48, height: 48, border: `2px solid ${COLORS.gold}` }} />
                <Box>
                    <Typography sx={{ 
                      color: COLORS.gold, 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      letterSpacing: '0.2em', 
                      textTransform: 'uppercase'
                    }}>
                      Personal Invitation
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 900, 
                      letterSpacing: '-0.02em',
                      color: 'text.primary'
                    }}>
                      {salon.name}
                    </Typography>
                </Box>
            </Stack>

            <Typography sx={{ 
              color: 'text.secondary', 
              fontSize: '12px', 
              lineHeight: 1.5, 
              fontWeight: 500,
              mb: 3,
              fontStyle: 'italic',
              opacity: 0.8
            }}>
              "The ritual awaits your return. Sanctuary entries are available today."
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button 
                variant="contained"
                onClick={onRebook}
                size="small"
                sx={{ 
                  bgcolor: 'text.primary', 
                  color: 'background.paper',
                  borderRadius: '100px',
                  px: 3,
                  fontWeight: 900,
                  fontSize: '11px',
                  '&:hover': { bgcolor: 'text.secondary' }
                }}
              >
                REBOOK
              </Button>
              <Button 
                variant="outlined"
                onClick={onViewProfile}
                size="small"
                startIcon={<User size={14} />}
                sx={{ 
                  borderRadius: '100px',
                  fontWeight: 800,
                  fontSize: '10px',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': { borderColor: COLORS.gold, color: COLORS.gold }
                }}
              >
                PROFILE
              </Button>
            </Stack>

            <Box sx={{ position: 'absolute', bottom: 16, right: 24, opacity: 0.3 }}>
                 <Sparkles size={24} color={COLORS.gold} />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default RebookHero;
