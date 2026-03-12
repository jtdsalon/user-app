import React from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Paper,
  useTheme,
  Tooltip,
  Typography,
  Chip,
  Stack,
  Menu,
  MenuItem,
  Divider,
  Button,
  useMediaQuery,
  SwipeableDrawer,
  GlobalStyles,
} from '@mui/material';
import { Search, X, SlidersHorizontal, Sparkles, TrendingUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedSearchAction } from './hooks/useFeedSearchAction';
import type { FeedFilters } from './types';

export type { FeedFilters };

interface FeedSearchProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  activeFilters: FeedFilters;
  onFilterChange?: (filters: FeedFilters) => void;
  placeholder?: string;
  suggestions?: string[];
}

export const FeedSearch: React.FC<FeedSearchProps> = ({
  searchQuery,
  onSearch,
  activeFilters,
  onFilterChange,
  placeholder = 'Search the archive...',
  suggestions = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

  const {
    queryLocal,
    setQueryLocal,
    isFocused,
    showSuggestions,
    setShowSuggestions,
    anchorEl,
    open,
    isDrawerOpen,
    setIsDrawerOpen,
    containerRef,
    handleClear,
    handleTagClick,
    handleSuggestionClick,
    handleFilterClick,
    handleFilterClickMobile,
    handleFilterClose,
    toggleCategory,
    handleSortChange,
    handleTypeChange,
    handleResetFilters,
    handleBlur,
    handleFocus,
    activeFilterCount,
    filteredSuggestions,
    TRENDING_TAGS,
    CATEGORIES,
  } = useFeedSearchAction({
    searchQuery,
    onSearch,
    activeFilters,
    onFilterChange,
    suggestions,
  });

  const glassBg = isDarkMode
    ? 'rgba(15, 23, 42, 0.85)'
    : 'rgba(255, 255, 255, 0.85)';

  const FilterContent = () => (
    <Box sx={{ p: isMobile ? 3 : 1.5 }}>
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.05em' }}>
            FILTERS
          </Typography>
          <IconButton onClick={handleFilterClose} size="small" sx={{ p: 1 }}>
            <X size={20} />
          </IconButton>
        </Box>
      )}

      <Typography
        sx={{ fontSize: '11px', fontWeight: 800, color: 'text.secondary', mb: 2, letterSpacing: '0.1em' }}
      >
        CATEGORIES
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat.toUpperCase()}
            size={isMobile ? 'medium' : 'small'}
            onClick={() => toggleCategory(cat)}
            sx={{
              height: isMobile ? 36 : 28,
              minHeight: isMobile ? 36 : 28,
              fontSize: isMobile ? '12px' : '10px',
              fontWeight: 800,
              bgcolor: activeFilters.categories.includes(cat) ? 'secondary.main' : 'transparent',
              color: activeFilters.categories.includes(cat) ? 'white' : 'text.primary',
              border: '1px solid',
              borderColor: activeFilters.categories.includes(cat) ? 'secondary.main' : 'divider',
              '&:hover': {
                bgcolor: activeFilters.categories.includes(cat) ? 'secondary.dark' : 'action.hover',
              },
            }}
          />
        ))}
      </Box>

      <Divider sx={{ mb: 2, opacity: 0.5 }} />

      <Typography
        sx={{ fontSize: '11px', fontWeight: 800, color: 'text.secondary', mb: 1.5, letterSpacing: '0.1em' }}
      >
        SORT BY
      </Typography>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <MenuItem onClick={() => handleSortChange('newest')} sx={{ borderRadius: '12px', py: 1.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, flex: 1 }}>Newest First</Typography>
          {activeFilters.sortBy === 'newest' && (
            <Check size={18} color={theme.palette.secondary.main} />
          )}
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('popular')} sx={{ borderRadius: '12px', py: 1.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, flex: 1 }}>Most Popular</Typography>
          {activeFilters.sortBy === 'popular' && (
            <Check size={18} color={theme.palette.secondary.main} />
          )}
        </MenuItem>
      </Stack>

      <Divider sx={{ mb: 2, opacity: 0.5 }} />

      <Typography
        sx={{ fontSize: '11px', fontWeight: 800, color: 'text.secondary', mb: 1.5, letterSpacing: '0.1em' }}
      >
        CONTENT TYPE
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          size={isMobile ? 'large' : 'small'}
          onClick={() => handleTypeChange('all')}
          sx={{
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 800,
            py: isMobile ? 1.5 : 0.75,
            bgcolor: activeFilters.contentType === 'all' ? 'text.primary' : 'transparent',
            color: activeFilters.contentType === 'all' ? 'background.paper' : 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: activeFilters.contentType === 'all' ? 'text.secondary' : 'action.hover',
            },
          }}
        >
          ALL
        </Button>
        <Button
          fullWidth
          size={isMobile ? 'large' : 'small'}
          onClick={() => handleTypeChange('before-after')}
          sx={{
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 800,
            py: isMobile ? 1.5 : 0.75,
            bgcolor: activeFilters.contentType === 'before-after' ? 'text.primary' : 'transparent',
            color: activeFilters.contentType === 'before-after' ? 'background.paper' : 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor:
                activeFilters.contentType === 'before-after' ? 'text.secondary' : 'action.hover',
            },
          }}
        >
          BEFORE/AFTER
        </Button>
      </Stack>

      {activeFilterCount > 0 && (
        <Button
          fullWidth
          sx={{ mt: 4, fontSize: '11px', fontWeight: 800, color: 'secondary.main', py: 1.5 }}
          onClick={handleResetFilters}
        >
          RESET ALL FILTERS
        </Button>
      )}
    </Box>
  );

  return (
    <Box
      ref={containerRef}
      sx={{ mb: 4, px: { xs: 0, sm: 0 }, position: 'relative', zIndex: 100 }}
    >
      <GlobalStyles
        styles={{
          '.MuiDrawer-paper': {
            borderTopLeftRadius: '28px !important',
            borderTopRightRadius: '28px !important',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          },
        }}
      />

      <motion.div
        initial={false}
        animate={{ y: isFocused ? -4 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Paper
          elevation={isFocused ? 12 : 0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: isMobile ? 2 : 2.5,
            py: isMobile ? 1 : 1.25,
            borderRadius: '24px',
            bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: isFocused
              ? 'secondary.main'
              : isDarkMode
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isFocused
              ? `0 24px 48px ${isDarkMode ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)'}, 0 0 0 1px ${theme.palette.secondary.main}20`
              : '0 4px 16px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at 20% 50%, ${theme.palette.secondary.main}0a, transparent 55%)`,
                  pointerEvents: 'none',
                  borderRadius: 'inherit',
                }}
              />
            )}
          </AnimatePresence>

          <Box sx={{ display: 'flex', alignItems: 'center', mr: isMobile ? 1.5 : 2 }}>
            <motion.div
              animate={{
                rotate: isFocused ? 12 : 0,
                scale: isFocused ? 1.08 : 1,
                color: isFocused ? theme.palette.secondary.main : theme.palette.text.secondary,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Search size={isMobile ? 20 : 22} strokeWidth={2.5} />
            </motion.div>
          </Box>

          <InputBase
            placeholder={placeholder}
            value={queryLocal}
            onChange={(e) => setQueryLocal(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowSuggestions(false);
            }}
            sx={{
              flex: 1,
              fontSize: isMobile ? 16 : 15,
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.01em',
              '& .MuiInputBase-input::placeholder': {
                opacity: 0.5,
                fontWeight: 500,
              },
            }}
          />

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 0.5 }}>
            <AnimatePresence mode="wait">
              {queryLocal ? (
                <motion.div
                  key="clear"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                >
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    onMouseDown={(e) => e.preventDefault()}
                    sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
                  >
                    <X size={14} />
                  </IconButton>
                </motion.div>
              ) : (
                <motion.div key="sparkle" initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }}>
                  <Sparkles size={18} />
                </motion.div>
              )}
            </AnimatePresence>

            <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 1 }} />

            <Tooltip title="Advanced Filters">
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={isMobile ? handleFilterClickMobile : handleFilterClick}
                  sx={{
                    color: isFocused || activeFilterCount > 0 ? 'secondary.main' : 'text.secondary',
                    bgcolor: activeFilterCount > 0 ? 'secondary.main' + '18' : 'transparent',
                    p: isMobile ? 1.25 : 0.75,
                    '&:hover': { bgcolor: activeFilterCount > 0 ? 'secondary.main' + '28' : 'action.hover' },
                  }}
                >
                  <SlidersHorizontal size={isMobile ? 22 : 20} />
                </IconButton>
                {activeFilterCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      px: 0.5,
                      bgcolor: 'secondary.main',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor: 'background.paper',
                    }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: 900, color: 'white' }}>
                      {activeFilterCount}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Tooltip>
          </Stack>

          <AnimatePresence>
            {showSuggestions && (filteredSuggestions.length > 0 || queryLocal.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 8,
                  zIndex: 1100,
                }}
              >
                <Paper
                  elevation={12}
                  sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    bgcolor: glassBg,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                  }}
                >
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((s, i) => (
                      <MenuItem
                        key={`${s}-${i}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(s)}
                        sx={{
                          py: 1.5,
                          px: 3,
                          gap: 2,
                          '&:hover': { bgcolor: 'secondary.main' + '12' },
                        }}
                      >
                        <Search size={16} style={{ opacity: 0.5 }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{s}</Typography>
                      </MenuItem>
                    ))
                  ) : (
                    <Box sx={{ py: 2, px: 3 }}>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        No suggestions for "{queryLocal}"
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </motion.div>

      {!isMobile && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleFilterClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 300,
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: glassBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          TransitionProps={{ timeout: 200 }}
        >
          <FilterContent />
        </Menu>
      )}

      <SwipeableDrawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={handleFilterClose}
        onOpen={() => setIsDrawerOpen(true)}
        disableBackdropTransition={false}
        disableDiscovery
        PaperProps={{
          sx: {
            maxHeight: '85vh',
            bgcolor: glassBg,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box sx={{ width: '100%', pb: 4, pt: 0.5 }}>
          <Box
            sx={{
              width: 44,
              height: 5,
              bgcolor: 'divider',
              borderRadius: 3,
              mx: 'auto',
              my: 1.5,
              flexShrink: 0,
            }}
          />
          <FilterContent />
        </Box>
      </SwipeableDrawer>

      <AnimatePresence>
        {!queryLocal && !isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.15 }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                mt: 2,
                px: 0.5,
                overflowX: 'auto',
                overflowY: 'hidden',
                pb: 0.5,
                '&::-webkit-scrollbar': { display: 'none' },
                WebkitOverflowScrolling: 'touch',
              }}
              alignItems="center"
            >
              <TrendingUp size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'text.secondary',
                  letterSpacing: '0.06em',
                  flexShrink: 0,
                }}
              >
                TRENDING
              </Typography>
              {TRENDING_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagClick(tag)}
                  sx={{
                    height: isMobile ? 32 : 28,
                    minHeight: isMobile ? 32 : 28,
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    color: 'text.secondary',
                    border: '1px solid transparent',
                    '&:hover': {
                      bgcolor: 'secondary.main',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              ))}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
