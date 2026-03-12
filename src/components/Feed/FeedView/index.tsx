import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Fade,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fab,
  Zoom
} from '@mui/material';
import { Plus } from 'lucide-react';
import { FeedItem } from '../FeedItem';
import { getFeedStrings } from '../properties';
import { FeedComposer } from '../FeedComposer';
import { MainLayout } from '../../common/layouts/MainLayout';
import { useAuth } from '../../Auth/AuthContext';
import { useFeedViewAction } from './hooks/useFeedViewAction';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile } from '@/state/profile';
import { StorySection } from '../components';
import { FeedSearch } from '../FeedSearch';

const FeedView: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const profile = useSelector((s: any) => s.profile?.profile);
  const currentUserId = user?.id || (user as any)?.sub;

  React.useEffect(() => {
    if (currentUserId) {
      dispatch(getProfile({ viewedUserId: currentUserId, isOwnProfile: true }) as any);
    }
  }, [currentUserId, dispatch]);

  const currentUser = user && profile?.id === user.id
    ? { ...user, avatar: profile?.avatar || user?.avatar }
    : user;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

  const {
    navigate,
    viewTab,
    setViewTab,
    displayedPosts,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    searchSuggestions,
    isLoadingMore,
    hasMore,
    isComposerOpen,
    editingPost,
    handleOpenComposer,
    handleEditPost,
    handleCloseComposer,
    handleDeletePost,
    handleSavePost,
    handleToggleLike,
    handleToggleSave,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleToggleCommentLike,
    handleUpdatePost,
    observerTarget,
  } = useFeedViewAction();

  const s = getFeedStrings();

  return (
    <MainLayout>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
        <Box sx={{ textAlign: 'center', pt: 6, mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: { xs: '1.5rem', sm: '2.5rem' } }}>
            {s.view.style} <Box component="span" sx={{ color: 'secondary.main' }}>{s.view.lookbook}</Box>
          </Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.4em', textTransform: 'uppercase' }}>{s.view.subtitle}</Typography>
        </Box>

        <Container maxWidth="sm">
          <StorySection />
          <FeedSearch
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
            suggestions={searchSuggestions}
          />
        </Container>

        <Box sx={{ position: 'sticky', top: { xs: 56, sm: 64 }, zIndex: 100, bgcolor: isDarkMode ? 'rgba(2, 6, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', py: 2, borderBottom: `1px solid ${theme.palette.divider}`, mb: 4 }}>
          <Container maxWidth="sm">
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: '100px', flex: 1, maxWidth: isMobile ? '100%' : 320 }}>
                <Button fullWidth onClick={() => setViewTab(0)} sx={{ borderRadius: '100px', fontSize: '10px', fontWeight: 900, bgcolor: viewTab === 0 ? 'background.paper' : 'transparent', color: viewTab === 0 ? 'text.primary' : 'text.secondary' }}>{s.view.tabFavorites}</Button>
                <Button fullWidth onClick={() => setViewTab(1)} sx={{ borderRadius: '100px', fontSize: '10px', fontWeight: 900, bgcolor: viewTab === 1 ? 'background.paper' : 'transparent', color: viewTab === 1 ? 'text.primary' : 'text.secondary' }}>{s.view.tabPublic}</Button>
              </Box>
              <Tooltip title={s.view.createEntry} arrow>
                <IconButton
                  onClick={handleOpenComposer}
                  sx={{
                    bgcolor: 'text.primary',
                    color: 'secondary.main',
                    width: 42,
                    height: 42,
                    minWidth: 42,
                    minHeight: 42,
                    flexShrink: 0,
                    borderRadius: '50%',
                    '&:hover': { bgcolor: 'text.secondary' },
                  }}
                >
                  <Plus size={20} strokeWidth={3} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="sm">
          <Fade in timeout={800} key={viewTab}>
            <Box>
              {loading ? (
                <Box sx={{ py: 12, textAlign: 'center' }}>
                  <CircularProgress size={32} sx={{ color: 'secondary.main' }} />
                </Box>
              ) : displayedPosts.length === 0 ? (
                <Box sx={{ py: 12, textAlign: 'center', opacity: 0.5 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {viewTab === 0 ? s.view.noFavoritesArchived : s.view.noPublicEntriesFound}
                  </Typography>
                </Box>
              ) : (
                displayedPosts.map(post => (
                  <FeedItem
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onUpdate={handleUpdatePost}
                    onViewSalon={(id: string) => navigate(`/salon/${id}`)}
                    onToggleLike={handleToggleLike}
                    onToggleSave={handleToggleSave}
                    onAddComment={handleAddComment}
                    onUpdateComment={handleUpdateComment}
                    onDeleteComment={handleDeleteComment}
                    onToggleCommentLike={handleToggleCommentLike}
                  />
                ))
              )}
              <Box ref={observerTarget} sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isLoadingMore && hasMore && (
                  <CircularProgress size={24} sx={{ color: 'secondary.main' }} />
                )}
              </Box>
            </Box>
          </Fade>

          <FeedComposer open={isComposerOpen} onClose={handleCloseComposer} onSave={handleSavePost} currentUser={currentUser} initialPost={editingPost} />
        </Container>

        {isMobile && (
          <Zoom in={!isComposerOpen}>
            <Fab
              onClick={handleOpenComposer}
              sx={{
                position: 'fixed',
                bottom: 100,
                right: 24,
                bgcolor: 'text.primary',
                color: 'secondary.main',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: 'text.secondary' }
              }}
            >
              <Plus size={24} strokeWidth={3} />
            </Fab>
          </Zoom>
        )}
      </Box>
    </MainLayout>
  );
};

export default FeedView;
