import React, { useState, useMemo, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  GlobalStyles,
  PaletteMode
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Salon, Artist, CartItem, ViewType } from '../../Home/types';
import Navbar from './Navbar';
import BookingModal from '../BookingModal';
import SmartBookingDialog from '../SmartBookingDialog';
import ChatDrawer from '@/components/Chat/ChatDrawer';
import { useAuth } from '../../Auth/AuthContext';
import { useBookingAction } from '../../../state/booking/useBookingAction';
import { LayoutContext } from './layoutContext';
import { followSalonApi, unfollowSalonApi } from '@/services/api/salonService';

export { useLayout } from './layoutContext';

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('glow_theme_mode');
    return (saved as PaletteMode) || 'light';
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isSmartBookingOpen, setIsSmartBookingOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const booking = useBookingAction();

  const sanitizeChats = (chats: any[]) =>
    chats.map((chat) => ({
      ...chat,
      participants: Array.isArray(chat.participants)
        ? chat.participants.map((participant: any) => ({
            ...participant,
            avatar: typeof participant?.avatar === 'string' && participant.avatar.includes('i.pravatar.cc')
              ? undefined
              : participant?.avatar,
          }))
        : [],
      messages: Array.isArray(chat.messages)
        ? chat.messages.map((message: any) => ({
            ...message,
            senderAvatar: typeof message?.senderAvatar === 'string' && message.senderAvatar.includes('i.pravatar.cc')
              ? undefined
              : message?.senderAvatar,
          }))
        : [],
    }));

  useEffect(() => {
    const loadFromStorage = () => {
      const savedFavs = localStorage.getItem('luxe_favs');
      setFavorites(savedFavs ? JSON.parse(savedFavs) : []);

      const savedFollows = localStorage.getItem('luxe_follows');
      setFollowedUsers(savedFollows ? JSON.parse(savedFollows) : []);

      const savedPostIds = localStorage.getItem('luxe_saved_posts');
      setSavedPosts(savedPostIds ? JSON.parse(savedPostIds) : []);

      const savedCart = localStorage.getItem('luxe_cart');
      setCart(savedCart ? JSON.parse(savedCart) : []);

      const savedChats = localStorage.getItem('aurora_chats');
      if (savedChats) {
        try {
          const chats: any[] = sanitizeChats(JSON.parse(savedChats));
          localStorage.setItem('aurora_chats', JSON.stringify(chats));
          setUnreadChatCount(chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0));
        } catch {
          setUnreadChatCount(0);
        }
      } else {
        setUnreadChatCount(0);
      }
    };

    const handleSessionExpired = () => {
      setFavorites([]);
      setFollowedUsers([]);
      setSavedPosts([]);
      setCart([]);
      setUnreadChatCount(0);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    const onSalonFollowedByBooking = (e: CustomEvent<{ salonId: string }>) => {
      const salonId = e.detail?.salonId;
      if (salonId) {
        setFavorites((prev) => (prev.includes(salonId) ? prev : [...prev, salonId]));
      }
    };
    window.addEventListener('booking:salon-followed', onSalonFollowedByBooking as EventListener);

    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    loadFromStorage();
    if (isAuthenticated) {
      booking.loadLastBooked();
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      window.removeEventListener('booking:salon-followed', onSalonFollowedByBooking as EventListener);
    };
  }, [location.pathname, booking.loadLastBooked, isChatOpen, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
  }, [cart]);

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('glow_theme_mode', next);
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    const isAdding = !favorites.includes(id);
    const newFavs = isAdding ? [...favorites, id] : favorites.filter(fid => fid !== id);
    setFavorites(newFavs);
    localStorage.setItem('luxe_favs', JSON.stringify(newFavs));
    if (isAuthenticated) {
      (isAdding ? followSalonApi(id) : unfollowSalonApi(id)).catch(() => {
        setFavorites(favorites);
        localStorage.setItem('luxe_favs', JSON.stringify(favorites));
      });
    }
  };

  const toggleFollowedUser = (id: string) => {
    const newFollows = followedUsers.includes(id) ? followedUsers.filter(fid => fid !== id) : [...followedUsers, id];
    setFollowedUsers(newFollows);
    localStorage.setItem('luxe_follows', JSON.stringify(newFollows));
  };

  const toggleSavePost = (id: string) => {
    const newSavedPosts = savedPosts.includes(id)
      ? savedPosts.filter((postId) => postId !== id)
      : [...savedPosts, id];
    setSavedPosts(newSavedPosts);
    localStorage.setItem('luxe_saved_posts', JSON.stringify(newSavedPosts));
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleOpenBooking = (salon: Salon, preselectedServiceId?: string | null) => booking.openBooking(salon, preselectedServiceId);
  const handleOpenArtistBooking = (artist: Artist) => booking.openArtistBooking(artist);
  const handleCloseBooking = () => booking.closeBooking();

  const handleBookingComplete = () => {
    if (isAuthenticated) booking.loadLastBooked();
  };

  // Realtime: when user returns to tab (e.g. from salon-app after adding staff), refetch booking data so card updates.
  useEffect(() => {
    const onFocus = () => {
      if (booking.salon || booking.artist) booking.refetchBookingData?.();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [booking.salon, booking.artist, booking.refetchBookingData]);

  const bookingDataForModal = useMemo(
    () => ({
      services: booking.services,
      staff: booking.staff,
      lookbook: booking.lookbook,
      bookingRules: booking.bookingRules,
      availability: booking.availability,
      loading: booking.loading,
      availabilityLoading: booking.availabilityLoading,
      submitLoading: booking.submitLoading,
      error: booking.error,
      submitError: booking.submitError,
      loadAvailability: booking.loadAvailability,
      submitBooking: booking.submitBooking,
    }),
    [
      booking.services,
      booking.staff,
      booking.lookbook,
      booking.bookingRules,
      booking.availability,
      booking.loading,
      booking.availabilityLoading,
      booking.submitLoading,
      booking.error,
      booking.submitError,
      booking.loadAvailability,
      booking.submitBooking,
    ]
  );

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#0F172A' : '#F8FAFC' },
      secondary: { main: mode === 'light' ? '#D4AF37' : '#E2C275' },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#020617',
        paper: mode === 'light' ? '#FFFFFF' : '#0F172A',
      },
      divider: mode === 'light' ? '#F1F5F9' : 'rgba(226, 194, 117, 0.12)',
    },
    typography: { fontFamily: '"Inter", sans-serif' },
    shape: { borderRadius: 24 }
  }), [mode]);

  const currentView = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/collection')) return 'collection';
    if (path.startsWith('/consultant')) return 'consultant';
    if (path.startsWith('/chat')) return 'chat';
    if (path.startsWith('/feed')) return 'feed';
    if (path.startsWith('/jobs')) return 'jobs';
    if (path.startsWith('/appointments')) return 'appointments';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/salon/')) return 'salon-profile';
    return 'home';
  }, [location.pathname]);

  const value = {
    mode, toggleColorMode, favorites, toggleFavorite, followedUsers, toggleFollowedUser, savedPosts, toggleSavePost, cart, addToCart, lastBooked: booking.lastBooked,
    handleOpenBooking, handleOpenArtistBooking, setIsSmartBookingOpen, isLoading, isChatOpen, setIsChatOpen,
    isChatMinimized, setIsChatMinimized, unreadChatCount
  };

  return (
    <LayoutContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={{
          body: {
            '&::before': {
              content: '""', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              pointerEvents: 'none', zIndex: 9999, opacity: mode === 'dark' ? 0.04 : 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }
          }
        }} />
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pb: isAuthenticated ? { xs: 12, md: 0 } : 0 }}>
          {isAuthenticated && (
            <Navbar
              currentView={currentView as ViewType}
              onViewChange={(v) => navigate(`/${v}`)}
              onSignIn={() => { }}
              onOpenCart={() => setIsCartOpen(true)}
              cartItemsCount={cart.reduce((s, i) => s + i.quantity, 0)}
            />
          )}
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
          {isAuthenticated && (
            <>
              <BookingModal
                salon={booking.salon}
                artist={booking.artist}
                preselectedServiceId={booking.preselectedServiceId}
                isOpen={booking.isOpen}
                onClose={handleCloseBooking}
                onBookingComplete={handleBookingComplete}
                bookingData={bookingDataForModal}
              />
              <SmartBookingDialog
                open={isSmartBookingOpen}
                onClose={() => setIsSmartBookingOpen(false)}
                onViewSalon={(id) => navigate(`/salon/${id}`)}
              />
              <ChatDrawer />
            </>
          )}
        </Box>
      </ThemeProvider>
    </LayoutContext.Provider>
  );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Box>{children}</Box>;
};