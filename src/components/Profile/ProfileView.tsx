import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid2,
  Stack,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  DialogActions,
  Switch,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit3,
  Settings,
  Image as ImageIcon,
  Heart,
  Sparkles,
  Grid as GridIcon,
  Bookmark,
  X,
  UserPlus,
  ChevronRight,
  Shield,
  Bell,
  Eye,
  LogOut,
  Trash2,
  AtSign,
  User,
  LayoutGrid,
  List as ListIcon,
  Camera
} from 'lucide-react';
import type { FeedPost } from '../Feed/types';
import { UserProfile } from './types';
import { useProfileAction } from './hooks/useProfileAction';
import { useAuth } from '@/components/Auth/AuthContext';
import { getFeedPosts, getSavedFeedPosts } from '@/state/feed';
import type { RootState } from '@/state/store';
import { FeedItem, FeedComposer } from '../Feed';
import { MainLayout } from '../common/layouts/MainLayout';
import { useFeedViewAction } from '../Feed/FeedView/hooks/useFeedViewAction';
import { optimizeImage } from '@/lib/util/imageProcessor';
import { getFullImageUrl } from '@/lib/util/imageUrl';

const EditProfileDialog = ({
  open,
  onClose,
  profile,
  onSave,
  saving
}: {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => Promise<void>;
  saving?: boolean;
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ ...profile });
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFormData({ ...profile });
    }
  }, [profile, open]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    setIsProcessing(true);
    try {
      const optimized = await optimizeImage(file, { maxWidth: 500, quality: 0.85 });
      setFormData(prev => ({ ...prev, avatar: optimized }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image optimization failed';
      setSnackbar({ open: true, message: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '32px', p: 1 } }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', letterSpacing: '0.1em', pt: 3 }}>
        EDIT ARCHIVE PROFILE
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{ position: 'relative', cursor: isProcessing ? 'wait' : 'pointer' }}
              onClick={handleImageClick}
            >
              <Avatar
                src={formData.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  border: `4px solid ${theme.palette.divider}`,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 0.8 },
                  opacity: isProcessing ? 0.5 : 1
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'background.paper',
                borderRadius: '50%',
                p: 0.8,
                border: `2px solid ${theme.palette.background.paper}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                '&:hover': { opacity: 0.9 }
              }}>
                {isProcessing ? <CircularProgress size={16} color="inherit" /> : <Camera size={16} />}
              </Box>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Visual Identity"
            variant="standard"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><User size={16} /></InputAdornment> }}
          />

          <TextField
            fullWidth
            label="Aesthetic Handle"
            variant="standard"
            value={formData.handle.replace('@', '')}
            onChange={(e) => setFormData({ ...formData, handle: `@${e.target.value}` })}
            InputProps={{ startAdornment: <InputAdornment position="start"><AtSign size={16} /></InputAdornment> }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ color: 'text.secondary', fontWeight: 700 }}>Cancel</Button>
        <Button
          variant="contained"
          disabled={isProcessing || saving}
          onClick={async () => {
            try {
              await onSave(formData);
              onClose();
            } catch (e) {
              // Keep dialog open; parent may show error
            }
          }}
          sx={{ borderRadius: '100px', px: 4, fontWeight: 800, bgcolor: 'primary.main', color: 'background.paper' }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity="error" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

const FavouritesListDialog = ({
  open,
  onClose,
  title,
  fetchUsers,
  navigate,
  getFullImageUrl,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  fetchUsers: (page: number) => Promise<{ id: string; name?: string; username?: string; avatar?: string }[]>;
  navigate: (path: string) => void;
  getFullImageUrl: (url: string | undefined) => string | undefined;
}) => {
  const [users, setUsers] = useState<{ id: string; name?: string; username?: string; avatar?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchUsers(1)
        .then(setUsers)
        .finally(() => setLoading(false));
    }
  }, [open, fetchUsers]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.1em', textAlign: 'center', py: 2 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 0, pb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : users.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>No one yet</Typography>
        ) : (
          <List>
            {users.map((u) => (
              <ListItem key={u.id} disablePadding>
                <ListItemButton onClick={() => { onClose(); navigate(`/profile/${u.id}`); }}>
                  <ListItemAvatar>
                    <Avatar src={getFullImageUrl(u.avatar)} sx={{ width: 40, height: 40 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={u.name || 'User'}
                    secondary={u.username ? (u.username.startsWith('@') ? u.username : `@${u.username}`) : ''}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }}
                    secondaryTypographyProps={{ fontSize: '12px' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

const SettingsDialog = ({ open, onClose, onSignOut }: { open: boolean; onClose: () => void; onSignOut: () => void }) => {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '32px', overflow: 'hidden' } }}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'background.paper', py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.2em' }}>SETTINGS</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}><X size={18} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List sx={{ py: 0 }}>
          <Box sx={{ p: 2, bgcolor: 'action.hover' }}><Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>ACCOUNT SECURITY</Typography></Box>
          <ListItem disablePadding><ListItemButton sx={{ py: 1.5, px: 3 }}><ListItemAvatar><Shield size={18} color={theme.palette.primary.main} /></ListItemAvatar><ListItemText primary={<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Two-Factor Authentication</Typography>} /><Switch size="small" color="primary" /></ListItemButton></ListItem>
          <Divider sx={{ opacity: 0.5 }} />
          <Box sx={{ p: 2, bgcolor: 'action.hover' }}><Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>NOTIFICATIONS</Typography></Box>
          <ListItem disablePadding><ListItemButton sx={{ py: 1.5, px: 3 }}><ListItemAvatar><Bell size={18} color={theme.palette.primary.main} /></ListItemAvatar><ListItemText primary={<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Push Notifications</Typography>} /><Switch size="small" defaultChecked color="primary" /></ListItemButton></ListItem>
          <Divider sx={{ opacity: 0.5 }} />
          <Box sx={{ p: 2, bgcolor: 'action.hover' }}><Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>PRIVACY & VISIBILITY</Typography></Box>
          <ListItem disablePadding><ListItemButton sx={{ py: 1.5, px: 3 }}><ListItemAvatar><Eye size={18} color={theme.palette.primary.main} /></ListItemAvatar><ListItemText primary={<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Private Archive</Typography>} /><Switch size="small" color="primary" /></ListItemButton></ListItem>
          <Divider sx={{ opacity: 0.5 }} />
          <ListItem disablePadding><ListItemButton onClick={onSignOut} sx={{ py: 2, px: 3, color: 'error.main' }}><ListItemAvatar><LogOut size={18} color={theme.palette.error.main} /></ListItemAvatar><ListItemText primary={<Typography sx={{ fontSize: '13px', fontWeight: 700 }}>Sign Out</Typography>} /></ListItemButton></ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
};

interface ProfileViewProps {
  onViewSalon?: (id: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onViewSalon }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

  const {
    profile,
    loading,
    error,
    saving,
    viewedUserId,
    isOwnProfile,
    updateProfile,
    followUser,
    unfollowUser,
    fetchFollowers,
    fetchFollowing,
  } = useProfileAction();
  const { logout } = useAuth();
  const feed = useSelector((s: RootState) => s.feed);
  const {
    handleUpdatePost,
    handleDeletePost,
    handleEditPost,
    handleSavePost,
    handleToggleLike,
    handleToggleSave,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleToggleCommentLike,
    handleOpenComposer,
    handleCloseComposer,
    isComposerOpen,
    editingPost,
  } = useFeedViewAction();

  const [activeTab, setActiveTab] = useState(0);
  const [displayMode, setDisplayMode] = useState<'grid' | 'feed'>('feed');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    dispatch(getFeedPosts() as any);
  }, [dispatch]);

  useEffect(() => {
    if (!isOwnProfile && activeTab === 2) {
      setActiveTab(0);
      return;
    }

    if (isOwnProfile && activeTab === 2 && !feed.saved.loading && !feed.saved.requestedOnce) {
      dispatch(getSavedFeedPosts({ page: 1 }) as any);
    }
  }, [activeTab, dispatch, feed.saved.loading, feed.saved.requestedOnce, isOwnProfile]);

  const handleUpdateProfile = async (updated: UserProfile) => {
    try {
      await updateProfile(updated);
      setIsEditOpen(false);
    } catch (err) {
      console.error('Profile update failed', err);
    }
  };

  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (profile?.isFollowing) {
        await unfollowUser();
      } else {
        await followUser();
      }
    } catch (err) {
      console.error('Follow toggle failed', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const currentUser = profile
    ? {
        id: profile.id,
        name: profile.name,
        handle: profile.handle,
        avatar: profile.avatar,
        type: profile.type,
        followers: profile.followers,
        following: profile.following,
        bio: profile.bio,
        isFollowing: profile.isFollowing,
      }
    : null;

  const myPosts = useMemo(
    () => (feed.posts || []).filter((p) => p.userId === viewedUserId),
    [feed.posts, viewedUserId]
  );
  const adoredPosts = useMemo(() => (feed.posts || []).filter((p) => p.likes > 80), [feed.posts]);
  const savedPosts = useMemo(() => feed.saved.posts || [], [feed.saved.posts]);

  const renderContent = (posts: FeedPost[]) => {
    if (posts.length === 0) {
      return (
        <Box sx={{ width: '100%', py: 8, textAlign: 'center' }}>
          <ImageIcon size={32} color={theme.palette.divider} style={{ marginBottom: 8 }} />
          <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>No content available</Typography>
        </Box>
      );
    }

    if (displayMode === 'grid') {
      return (
        <Grid2 container spacing={1}>
          {posts.map((post) => (
            <Grid2 key={post.id} size={{ xs: 4 }}>
              <Box
                onClick={() => setDisplayMode('feed')}
                sx={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover .overlay': { opacity: 1 }
                }}
              >
                <Box component="img" src={getFullImageUrl(post.image)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box className="overlay" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', color: '#fff', gap: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Sparkles size={14} fill="#fff" />
                    <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>{post.likes}</Typography>
                  </Stack>
                </Box>
              </Box>
            </Grid2>
          ))}
        </Grid2>
      );
    }

    return (
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        {posts.map(post => (
          <FeedItem
            key={post.id}
            post={post}
            currentUser={currentUser}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onViewSalon={onViewSalon}
            onToggleLike={handleToggleLike}
            onToggleSave={handleToggleSave}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onToggleCommentLike={handleToggleCommentLike}
          />
        ))}
      </Box>
    );
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate('/profile')} sx={{ mt: 2 }}>Back to Profile</Button>
      </Box>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ height: 160, bgcolor: isDarkMode ? 'background.paper' : 'action.hover', borderBottom: `1px solid ${theme.palette.divider}`, position: 'relative' }}>
        {!isOwnProfile && (
          <Button
            startIcon={<ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />}
            onClick={() => navigate('/profile')}
            sx={{ position: 'absolute', top: 20, left: 20, color: 'text.primary', fontWeight: 800, fontSize: '10px', bgcolor: 'background.paper', backdropFilter: 'blur(4px)', borderRadius: '100px', px: 2, border: `1px solid ${theme.palette.divider}` }}
          >
            My Profile
          </Button>
        )}
      </Box>

      <Container maxWidth="sm" sx={{ mt: -6, position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800} key={viewedUserId}>
          <Box>
            {/* Header Content with Improved Visibility */}
            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={isMobile ? 2 : 3}
              alignItems={isMobile ? "center" : "flex-end"}
              sx={{ mb: 4, textAlign: isMobile ? 'center' : 'left' }}
            >
              <Avatar
                key={currentUser.avatar ? `avatar-${String(currentUser.avatar).slice(-40)}` : 'avatar-default'}
                src={getFullImageUrl(currentUser.avatar)}
                sx={{
                  width: 100,
                  height: 100,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  flexShrink: 0
                }}
              />

              <Box sx={{ flex: 1, minWidth: 0, width: '100%', pb: isMobile ? 0 : 1 }}>
                <Typography
                  sx={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: 'text.primary',
                    lineHeight: 1.2,
                    mb: 0.5,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {currentUser.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'secondary.main',
                    mb: 2,
                    display: 'block'
                  }}
                >
                  {currentUser.handle}
                </Typography>

                <Stack direction="row" spacing={isMobile ? 3 : 2.5} justifyContent={isMobile ? "center" : "flex-start"}>
                  <Box sx={{ cursor: 'pointer' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: 'text.primary' }}>{myPosts.length}</Typography>
                    <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em' }}>POSTS</Typography>
                  </Box>
                  <Box sx={{ cursor: 'pointer' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: 'text.primary' }}>{currentUser.followers}</Typography>
                    <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em' }}>FAVOURITED</Typography>
                  </Box>
                  <Box sx={{ cursor: 'pointer' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: 'text.primary' }}>{currentUser.following}</Typography>
                    <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em' }}>FAVOURITES</Typography>
                  </Box>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1} sx={{ pb: isMobile ? 0 : 1 }}>
                {isOwnProfile ? (
                  <>
                    <IconButton
                      onClick={handleOpenComposer}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        p: 1.2,
                        bgcolor: 'background.paper',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Camera size={18} color={theme.palette.text.primary} />
                    </IconButton>
                    <IconButton
                      onClick={() => setIsSettingsOpen(true)}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        p: 1.2,
                        bgcolor: 'background.paper',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Settings size={18} color={theme.palette.text.primary} />
                    </IconButton>
                    <Button
                      variant="contained"
                      disableElevation
                      startIcon={<Edit3 size={14} />}
                      onClick={() => setIsEditOpen(true)}
                      sx={{
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 900,
                        bgcolor: 'text.primary',
                        color: 'background.paper',
                        px: 3,
                        boxShadow: '0 8px 16px rgba(15, 23, 42, 0.1)',
                        '&:hover': { bgcolor: 'text.secondary' }
                      }}
                    >
                      Edit
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    disableElevation
                    disabled={followLoading}
                    startIcon={followLoading ? <CircularProgress size={14} color="inherit" /> : <UserPlus size={14} />}
                    onClick={handleFollowToggle}
                    sx={{
                      borderRadius: '100px',
                      fontSize: '11px',
                      fontWeight: 800,
                      bgcolor: profile?.isFollowing ? 'action.hover' : 'primary.main',
                      color: profile?.isFollowing ? 'text.primary' : 'background.paper',
                      px: 3,
                      border: profile?.isFollowing ? `1px solid ${theme.palette.divider}` : 'none',
                    }}
                  >
                    {profile?.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </Stack>
            </Stack>

            <Typography
              sx={{
                fontSize: '13px',
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.6,
                fontWeight: 300,
                px: isMobile ? 2 : 0.5,
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              {currentUser.bio}
            </Typography>

            {/* Content Filters */}
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.default', position: 'sticky', top: { xs: 56, sm: 64 }, zIndex: 10 }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                sx={{
                  flex: 1,
                  '& .MuiTabs-indicator': { bgcolor: 'text.primary', height: 2 },
                  '& .MuiTab-root': { fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', minWidth: isMobile ? 'auto' : 80, px: isMobile ? 1.5 : 2, color: 'text.secondary' },
                  '& .Mui-selected': { color: 'text.primary !important' }
                }}
              >
                <Tab icon={<GridIcon size={14} />} label={isMobile ? "" : "ARCHIVE"} />
                <Tab icon={<Sparkles size={14} />} label={isMobile ? "" : "GLOWS"} />
                {isOwnProfile && <Tab icon={<Bookmark size={14} />} label={isMobile ? "" : "SAVED"} />}
              </Tabs>

              <Stack direction="row" spacing={0.5} sx={{ px: 1 }}>
                <Tooltip title="Grid View">
                  <IconButton
                    size="small"
                    onClick={() => setDisplayMode('grid')}
                    sx={{ color: displayMode === 'grid' ? 'text.primary' : 'text.secondary' }}
                  >
                    <LayoutGrid size={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Feed View">
                  <IconButton
                    size="small"
                    onClick={() => setDisplayMode('feed')}
                    sx={{ color: displayMode === 'feed' ? 'text.primary' : 'text.secondary' }}
                  >
                    <ListIcon size={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Box sx={{ py: 2 }}>
              {activeTab === 0 && renderContent(myPosts)}
              {activeTab === 1 && renderContent(adoredPosts)}
              {isOwnProfile && activeTab === 2 && (
                feed.saved.loading ? (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress color="secondary" />
                  </Box>
                ) : savedPosts.length > 0 ? (
                  renderContent(savedPosts)
                ) : (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Bookmark size={32} color={theme.palette.divider} style={{ marginBottom: 8 }} />
                    <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>No saved masterpieces yet</Typography>
                  </Box>
                )
              )}
            </Box>
          </Box>
        </Fade>
      </Container>

      <EditProfileDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile!}
        onSave={handleUpdateProfile}
        saving={saving}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSignOut={() => { logout(); setIsSettingsOpen(false); navigate('/'); }}
      />

      <FavouritesListDialog
        open={followersDialogOpen}
        onClose={() => setFollowersDialogOpen(false)}
        title="FAVOURITES"
        fetchUsers={fetchFollowers}
        navigate={navigate}
        getFullImageUrl={getFullImageUrl}
      />
      <FavouritesListDialog
        open={followingDialogOpen}
        onClose={() => setFollowingDialogOpen(false)}
        title="FAVOURITED"
        fetchUsers={fetchFollowing}
        navigate={navigate}
        getFullImageUrl={getFullImageUrl}
      />

      <FeedComposer
        open={isComposerOpen}
        onClose={handleCloseComposer}
        onSave={handleSavePost}
        initialPost={editingPost}
        currentUser={{
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          type: currentUser.type || 'customer'
        }}
      />
    </Box>
  );
};

export default ProfileView;
