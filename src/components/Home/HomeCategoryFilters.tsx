
import React from 'react';
import { Box, Button, useTheme } from '@mui/material';

interface HomeCategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

const HomeCategoryFilters: React.FC<HomeCategoryFiltersProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        overflowY: 'visible',
        width: '100%',
        pt: 1,
        pb: { xs: 4, sm: 6 },
        px: 1,
        scrollSnapType: 'x proximity',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <Button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            sx={{
              minWidth: { xs: 90, sm: 120 },
              height: { xs: 36, sm: 44 },
              flexShrink: 0,
              scrollSnapAlign: 'start',
              borderRadius: '100px',
              fontSize: '10px',
              fontWeight: 900,
              bgcolor: isActive ? 'text.primary' : 'background.paper',
              color: isActive ? (mode === 'light' ? '#fff' : '#0F172A') : theme.palette.text.secondary,
              border: '1px solid',
              borderColor: isActive ? 'text.primary' : theme.palette.divider,
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              letterSpacing: '0.12em',
              willChange: 'transform, background-color',
              '&:hover': {
                bgcolor: isActive ? 'text.secondary' : 'action.hover',
                borderColor: isActive ? 'text.secondary' : 'secondary.main',
                transform: 'scale(1.05)',
                color: isActive ? 'inherit' : 'secondary.main'
              },
              '&:active': { transform: 'scale(0.92)' }
            }}
          >
            {cat.toUpperCase()}
          </Button>
        );
      })}
    </Box>
  );
};

export default HomeCategoryFilters;
