
import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  useTheme,
  keyframes,
  Drawer,
  ListItemIcon,
  ListItemButton,
  Tooltip,
  Paper,
  useMediaQuery,
  styled,
  Button
} from '@mui/material';
import {
  Bell,
  Sparkles,
  MessageCircle,
  UserPlus,
  AtSign,
  User,
  ShoppingBag,
  BrainCircuit,
  Menu as MenuIcon,
  Home,
  Calendar,
  Sun,
  Moon,
  Image as ImageIcon,
  Briefcase,
  X,
  LogOut
} from 'lucide-react';
import { Notification, ViewType } from '../../Home/types';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import { getNotificationStrings } from '../../Notifications/properties';
import { getNotificationsApi, markAllNotificationsReadApi } from '@/services/api/notificationsService';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useLayout } from './layoutContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignIn: () => void;
  onOpenCart: () => void;
  cartItemsCount: number;
}

const pulseBadge = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ClassicBottomNav = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: 'auto',
  minHeight: '72px',
  borderRadius: '24px 24px 0 0',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: `12px 10px calc(12px + env(safe-area-inset-bottom, 16px)) 10px`,
  zIndex: theme.zIndex.appBar,
  backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: theme.palette.mode === 'light' ? '0 -10px 40px rgba(0,0,0,0.05)' : '0 -10px 40px rgba(0,0,0,0.4)',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ClassicNavItem = styled(Box, { shouldForwardProp: (prop) => prop !== 'active' })<{ active?: boolean }>(({ theme, active }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  padding: '8px',
  flex: 1,
  color: active ? theme.palette.secondary.main : theme.palette.text.secondary,
  '&:hover': { transform: active ? 'none' : 'translateY(-4px)' },
  '&:active': { transform: 'scale(0.85)' },
}));

const ActiveDot = styled(Box)(({ theme }) => ({
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  backgroundColor: theme.palette.secondary.main,
  marginTop: '4px',
  animation: `${fadeIn} 0.4s cubic-bezier(0.23, 1, 0.32, 1)`,
  boxShadow: `0 0 10px ${theme.palette.secondary.main}`,
}));

const NavLabel = styled(Typography, { shouldForwardProp: (prop) => prop !== 'active' })<{ active?: boolean }>(({ theme, active }) => ({
  fontSize: '9px',
  fontWeight: active ? 900 : 700,
  marginTop: '4px',
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  opacity: active ? 1 : 0.6,
}));

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, onSignIn, onOpenCart, cartItemsCount }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const notifStrings = getNotificationStrings();
  const { toggleColorMode, setIsChatOpen, isChatOpen, unreadChatCount } = useLayout();
  const { user, logout } = useAuth();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (cartItemsCount > 0) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartItemsCount]);

  const fetchNavbarNotifications = useCallback(() => {
    if (!user) return;
    getNotificationsApi(1, 10)
      .then((res) => {
        const body = (res?.data as any) ?? {};
        const data = Array.isArray(body) ? body : body?.data;
        const list = Array.isArray(data) ? data : [];
        setNotifications(list.map((n: any) => ({
          id: n.id,
          fromUserId: n.fromUserId,
          fromUserName: n.fromUserName || 'Someone',
          fromUserAvatar: n.fromUserAvatar ?? '',
          type: n.type,
          message: n.message || '',
          timeAgo: n.timeAgo || 'Just now',
          isRead: !!n.isRead,
        })));
      })
      .catch(() => setNotifications([]));
  }, [user]);

  useEffect(() => {
    fetchNavbarNotifications();
  }, [fetchNavbarNotifications]);

  const realtime = useRealtime();
  useEffect(() => {
    if (!realtime) return;
    return realtime.subscribe('notification_new', () => {
      fetchNavbarNotifications();
    });
  }, [realtime, fetchNavbarNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenNotifications = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotifAnchorEl(event.currentTarget);
    fetchNavbarNotifications();
  };

  const handleCloseNotifications = () => {
    setNotifAnchorEl(null);
    if (unreadCount > 0) {
      markAllNotificationsReadApi().catch(() => { });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleOpenProfile = (event: React.MouseEvent<HTMLButtonElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfile = () => {
    setProfileAnchorEl(null);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'booking_new':
      case 'booking_confirmed':
      case 'booking_rescheduled':
      case 'booking_cancelled':
      case 'cancellation_customer':
      case 'cancellation_salon':
      case 'cancellation_system':
        return <Calendar size={12} color={theme.palette.secondary.main} strokeWidth={2.5} />;
      case 'job_application_new':
      case 'job_application_approved':
      case 'job_application_rejected':
        return <Briefcase size={12} color="#06B6D4" strokeWidth={2.5} />;
      case 'review_new':
      case 'rating_new':
      case 'reply_to_review':
        return <Sparkles size={12} color="#F59E0B" strokeWidth={2.5} />;
      case 'like':
        return <Sparkles size={12} color={theme.palette.secondary.main} strokeWidth={2.5} />;
      case 'comment':
        return <MessageCircle size={12} color="#4F46E5" strokeWidth={2.5} />;
      case 'follow':
        return <UserPlus size={12} color="#10B981" strokeWidth={2.5} />;
      case 'mention':
        return <AtSign size={12} color={theme.palette.text.primary} strokeWidth={2.5} />;
      default:
        return <Bell size={12} />;
    }
  };

  const desktopNavItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
    { label: 'Salons', view: 'home', icon: <Home size={18} /> },
    { label: 'Lookbook', view: 'feed', icon: <ImageIcon size={18} /> },
    // { label: 'Products', view: 'collection', icon: <ShoppingBag size={18} /> },
    // { label: 'AI Help', view: 'consultant', icon: <BrainCircuit size={18} /> },
    { label: 'Jobs', view: 'jobs', icon: <Briefcase size={18} /> },
    { label: 'Bookings', view: 'appointments', icon: <Calendar size={18} /> },
  ];

  const mobileNavItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
    { label: 'Home', view: 'home', icon: <Home size={20} /> },
    { label: 'Lookbook', view: 'feed', icon: <ImageIcon size={20} /> },
    // { label: 'AI Chat', view: 'consultant', icon: <BrainCircuit size={20} /> },
    { label: 'Jobs', view: 'jobs', icon: <Briefcase size={20} /> },
    { label: 'Bookings', view: 'appointments', icon: <Calendar size={20} /> },
  ];

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1, px: { xs: 1, md: 4 }, justifyContent: 'space-between' }}>

            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: theme.palette.text.primary, mr: 1, transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', '&:hover': { transform: 'scale(1.1)' } }}
              >
                <MenuIcon size={24} />
              </IconButton>
            </Box>

            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { opacity: 0.8 } }}
              onClick={() => navigate('/home')}
            >
              <Typography
                variant="h5"
                sx={{
                  letterSpacing: '0.25em',
                  color: 'text.primary',
                  fontWeight: 900,
                  fontSize: { xs: '0.9rem', sm: '1.25rem' },
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'uppercase'
                }}
              >
                GLOW<Box component="span" sx={{ color: 'secondary.main', ml: 1 }}>BEAUTY</Box>
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
              {desktopNavItems.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <Box
                    key={item.view}
                    onClick={() => onViewChange(item.view)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      cursor: 'pointer',
                      position: 'relative',
                      py: 1,
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: isActive ? '100%' : '0%',
                        height: '2px',
                        bgcolor: 'secondary.main',
                        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                        transform: 'translateX(-50%)',
                        boxShadow: isActive ? '0 0 10px rgba(212, 175, 55, 0.5)' : 'none'
                      },
                      '&:hover:after': {
                        width: '100%'
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: isActive ? 900 : 700,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                        '&:hover': { color: 'text.primary' }
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
                <IconButton
                  size="small"
                  onClick={toggleColorMode}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    p: 1.2,
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', transform: 'rotate(15deg)' },
                    '&:active': { transform: 'scale(0.85)' }
                  }}
                >
                  {isDarkMode ? <Sun size={18} color="#FDE68A" /> : <Moon size={18} color="#475569" />}
                </IconButton>
              </Tooltip>

              {/* TODO: <IconButton
                size="small"
                onClick={onOpenCart}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  p: 1.2,
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', transform: 'translateY(-2px)' },
                  '&:active': { transform: 'scale(0.85)' }
                }}
              >
                <Badge
                  badgeContent={cartItemsCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: 'text.primary',
                      color: 'background.paper',
                      fontSize: '9px',
                      fontWeight: 900,
                      minWidth: '16px',
                      height: '16px',
                      border: `2px solid ${theme.palette.background.paper}`,
                      animation: cartPulse ? `${pulseBadge} 0.5s ease-out` : 'none'
                    }
                  }}
                >
                  <ShoppingBag size={18} />
                </Badge>
              </IconButton> */}

              {/* TODO:<IconButton
                size="small"
                onClick={() => setIsChatOpen?.(true)}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isChatOpen ? 'text.primary' : 'background.paper',
                  color: isChatOpen ? 'background.paper' : 'inherit',
                  p: 1.2,
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': { bgcolor: isChatOpen ? 'text.primary' : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'), transform: 'translateY(-2px)' },
                  '&:active': { transform: 'scale(0.85)' }
                }}
              >
                <Badge
                  badgeContent={unreadChatCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: 'secondary.main',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 900,
                      minWidth: '16px',
                      height: '16px',
                      border: `2px solid ${theme.palette.background.paper}`
                    }
                  }}
                >
                  <MessageCircle size={18} />
                </Badge>
              </IconButton> */}

              <IconButton
                size="small"
                onClick={handleOpenNotifications}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: Boolean(notifAnchorEl) ? 'text.primary' : 'background.paper',
                  color: Boolean(notifAnchorEl) ? 'background.paper' : 'inherit',
                  p: 1.2,
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': { bgcolor: Boolean(notifAnchorEl) ? 'text.primary' : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'), transform: 'translateY(-2px)' },
                  '&:active': { transform: 'scale(0.85)' }
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: 'secondary.main',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 900,
                      minWidth: '16px',
                      height: '16px',
                      border: `2px solid ${theme.palette.background.paper}`
                    }
                  }}
                >
                  <Bell size={18} />
                </Badge>
              </IconButton>

              <Popover
                open={Boolean(notifAnchorEl)}
                anchorEl={notifAnchorEl}
                onClose={handleCloseNotifications}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 2,
                    width: 320,
                    maxHeight: 480,
                    borderRadius: '24px',
                    boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    bgcolor: 'background.paper'
                  }
                }}
              >
                <Box sx={{ p: 2, bgcolor: isDarkMode ? 'rgba(15, 23, 42, 1)' : '#0A0F1C', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{notifStrings.popover.title}</Typography>
                  {unreadCount > 0 && <Typography sx={{ fontSize: '9px', fontWeight: 600, color: 'secondary.main' }}>{unreadCount} {notifStrings.view.new}</Typography>}
                </Box>
                <Box sx={{ maxHeight: 340, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '10px' } }}>
                  <List sx={{ p: 0 }}>
                    {notifications.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Bell size={24} color={theme.palette.divider} />
                        <Typography sx={{ mt: 1, fontSize: '11px', color: 'text.secondary' }}>{notifStrings.popover.noUpdates}</Typography>
                      </Box>
                    ) : (
                      notifications.slice(0, 4).map((notif, idx) => (
                        <React.Fragment key={notif.id}>
                          <ListItem
                            alignItems="flex-start"
                            sx={{
                              py: 2,
                              px: 2,
                              cursor: 'pointer',
                              bgcolor: notif.isRead ? 'transparent' : 'rgba(212, 175, 55, 0.03)',
                              transition: 'background-color 0.2s',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 48 }}>
                              <Box sx={{ position: 'relative' }}>
                                <Avatar src={getFullImageUrl(notif.fromUserAvatar ?? '')} sx={{ width: 36, height: 36, border: `1px solid ${theme.palette.divider}` }} />
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: -2,
                                  right: -2,
                                  bgcolor: 'background.paper',
                                  borderRadius: '50%',
                                  p: 0.4,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {getNotifIcon(notif.type)}
                                </Box>
                              </Box>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.primary' }}>
                                  {notif.fromUserName} <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>{notif.message}</Box>
                                </Typography>
                              }
                              secondary={
                                <Typography sx={{ fontSize: '9px', color: 'text.secondary', mt: 0.5, fontWeight: 600, opacity: 0.6 }}>{notif.timeAgo}</Typography>
                              }
                            />
                          </ListItem>
                          {idx < Math.min(notifications.length, 4) - 1 && <Divider component="li" sx={{ borderColor: theme.palette.divider, mx: 2 }} />}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </Box>
                <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Button
                    fullWidth
                    onClick={() => {
                      handleCloseNotifications();
                      navigate('/notifications');
                    }}
                    sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}
                  >
                    {notifStrings.popover.viewAllActivity}
                  </Button>
                </Box>
              </Popover>

              <IconButton
                size="small"
                onClick={handleOpenProfile}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: (currentView === 'profile' || Boolean(profileAnchorEl)) ? 'text.primary' : 'background.paper',
                  color: (currentView === 'profile' || Boolean(profileAnchorEl)) ? 'background.paper' : 'inherit',
                  p: 1.2,
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': { bgcolor: currentView === 'profile' ? 'text.primary' : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'), transform: 'scale(1.1)' },
                  '&:active': { transform: 'scale(0.85)' }
                }}
              >
                {user ? (
                  <Typography sx={{ fontSize: '10px', fontWeight: 900 }}>{user.firstName[0]}{user.lastName[0]}</Typography>
                ) : <User size={18} />}
              </IconButton>

              <Popover
                open={Boolean(profileAnchorEl)}
                anchorEl={profileAnchorEl}
                onClose={handleCloseProfile}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 2,
                    width: 200,
                    borderRadius: '20px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden'
                  }
                }}
              >
                <List sx={{ p: 0 }}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => { handleCloseProfile(); navigate('/profile'); }}>
                      <ListItemIcon sx={{ minWidth: 32 }}><User size={16} /></ListItemIcon>
                      <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize: '13px', fontWeight: 700 }} />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => { handleCloseProfile(); logout(); }}>
                      <ListItemIcon sx={{ minWidth: 32 }}><LogOut size={16} color={theme.palette.error.main} /></ListItemIcon>
                      <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '13px', fontWeight: 700, color: theme.palette.error.main }} />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Popover>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'background.paper',
            borderRadius: '0 32px 32px 0',
            boxShadow: '40px 0 100px rgba(0,0,0,0.2)'
          }
        }}
      >
        <Box sx={{ p: 3, pt: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" sx={{ letterSpacing: '0.2em', color: 'text.primary', fontWeight: 900, mb: 6, textAlign: 'center' }}>
            GLOW<Box component="span" sx={{ color: 'secondary.main' }}>BEAUTY</Box>
          </Typography>
          <List>
            {[...desktopNavItems, { label: 'My Profile', view: 'profile' as ViewType, icon: <User size={18} /> }].map((item) => (
              <ListItem key={item.view} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavClick(item.view)}
                  selected={currentView === item.view}
                  sx={{
                    borderRadius: '16px',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    '&.Mui-selected': { bgcolor: 'rgba(212, 175, 55, 0.12)', color: 'secondary.main', transform: 'translateX(8px)' },
                    '&:hover': { transform: 'translateX(8px)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.secondary', transition: 'color 0.3s' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.05em' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 'auto', p: 2, pb: 4 }}>
            {user ? (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogOut size={18} />}
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                sx={{ borderRadius: '100px', py: 2, fontWeight: 900, letterSpacing: '0.1em' }}
              >
                LOGOUT
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={onSignIn}
                sx={{ borderRadius: '100px', bgcolor: 'text.primary', py: 2, fontWeight: 900, letterSpacing: '0.1em' }}
              >
                SIGN IN
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      {isMobile && (
        <ClassicBottomNav elevation={0}>
          {mobileNavItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <ClassicNavItem
                key={item.view}
                active={isActive}
                onClick={() => onViewChange(item.view)}
              >
                {React.cloneElement(item.icon as React.ReactElement<any>, {
                  color: isActive ? theme.palette.secondary.main : theme.palette.text.secondary,
                  size: 22,
                  strokeWidth: isActive ? 2.5 : 2
                })}
                <NavLabel active={isActive}>
                  {item.label}
                </NavLabel>
                {isActive && <ActiveDot />}
              </ClassicNavItem>
            );
          })}
        </ClassicBottomNav>
      )}
    </>
  );
};

export default Navbar;
