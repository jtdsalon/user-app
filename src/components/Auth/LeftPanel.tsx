import React from 'react'
import { Box, Container, Fade, Stack, Typography } from '@mui/material'
import { Sparkles } from 'lucide-react'
import { getAuthStrings } from './properties'

const LeftPanel: React.FC = () => {
  const STR = getAuthStrings()

  return (
    <Box sx={{ flex: { md: 1.2, lg: 1.5 }, position: 'relative', height: { xs: '320px', md: '100vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Box component="img" src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1600" sx={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 100%)', backdropFilter: 'blur(2px)' }} />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', px: 4 }}>
        <Fade in timeout={1000}>
          <Box>
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
              <Sparkles size={32} color="secondary.main" />
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                GLOW<Box component="span" sx={{ color: 'secondary.main' }}>BEAUTY</Box>
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em', display: { xs: 'none', md: 'block' } }}>{STR.leftPanel.title}</Typography>
            <Typography sx={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.8, opacity: 0.9, maxWidth: 480, mx: 'auto' }}>{STR.leftPanel.description}</Typography>
            <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 5, display: { xs: 'none', md: 'flex' } }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>{STR.leftPanel.stats.salons}</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.6, letterSpacing: 1 }}>{STR.leftPanel.stats.salonsLabel}</Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={900}>{STR.leftPanel.stats.stylists}</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.6, letterSpacing: 1 }}>{STR.leftPanel.stats.stylistsLabel}</Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={900}>{STR.leftPanel.stats.rating}</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.6, letterSpacing: 1 }}>{STR.leftPanel.stats.ratingLabel}</Typography>
              </Box>
            </Stack>
          </Box>
        </Fade>
      </Container>
    </Box>
  )
}

export default LeftPanel
