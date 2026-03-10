
import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Button, Fade } from '@mui/material';
import { X } from 'lucide-react';

interface HomeSubViewHeaderProps {
  title: string;
  onClose: () => void;
}

const HomeSubViewHeader: React.FC<HomeSubViewHeaderProps> = ({ title, onClose }) => {
  return (
    <Box sx={{ mb: { xs: 3, sm: 5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <Fade in timeout={800}>
        <Box>
          <Breadcrumbs sx={{ mb: 0.5, '& .MuiBreadcrumbs-separator': { fontSize: '10px' } }}>
            <MuiLink 
              component="button" 
              onClick={onClose} 
              sx={{ 
                color: 'text.secondary', 
                fontSize: '9px', 
                fontWeight: 800, 
                textDecoration: 'none', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                cursor: 'pointer',
                '&:hover': { color: 'secondary.main' }
              }}
            >
              EXPLORE
            </MuiLink>
            <Typography sx={{ color: 'secondary.main', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ 
            fontWeight: 900, 
            color: 'text.primary', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em',
            fontSize: { xs: '1.4rem', sm: '2rem' },
            lineHeight: 1.2
          }}>
            {title}
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Button
          onClick={onClose}
          endIcon={<X size={14} />}
          sx={{
            fontSize: '10px',
            fontWeight: 900,
            color: 'text.secondary',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            p: 0.5,
            minWidth: 'auto',
            '&:hover': {
              bgcolor: 'transparent',
              color: 'secondary.main'
            }
          }}
        >
          CLOSE
        </Button>
      </Fade>
    </Box>
  );
};

export default HomeSubViewHeader;
