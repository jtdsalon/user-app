import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/components/Auth/AuthContext';
import AuthView from '@/components/Auth';
import { ROUTES } from './routeConfig';
import ProtectedLayout from './ProtectedLayout';
// import Apppp from '@/components/test/luxebook-salon-portal-old/App';
// import Apppp from '@/components/test/glow-beauty-salon-portal-new/App';

// Lazy-loaded for code splitting
const LazyHome = lazy(() => import('./routePages').then((m) => ({ default: m.HomePage })));
const LazySalons = lazy(() => import('./routePages').then((m) => ({ default: m.SalonsPage })));
const LazySalonProfile = lazy(() => import('./routePages').then((m) => ({ default: m.SalonProfilePage })));
// const LazyChat = lazy(() => import('./routePages').then((m) => ({ default: m.ChatPage })));
const LazyFeed = lazy(() => import('./routePages').then((m) => ({ default: m.FeedPage })));
const LazyPostDetail = lazy(() => import('./routePages').then((m) => ({ default: m.PostDetailPage })));
const LazyJobs = lazy(() => import('./routePages').then((m) => ({ default: m.JobsPage })));
const LazyBooking = lazy(() => import('./routePages').then((m) => ({ default: m.BookingPage })));
const LazyProfile = lazy(() => import('./routePages').then((m) => ({ default: m.ProfilePage })));
const LazyProfileById = lazy(() => import('./routePages').then((m) => ({ default: m.ProfileByIdPage })));
const LazyNotifications = lazy(() => import('./routePages').then((m) => ({ default: m.NotificationsPage })));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
    <CircularProgress color="secondary" />
  </Box>
);

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <AuthView />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      {/* <Route path={ROUTES.LOGIN} element={<Apppp />} /> */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected routes with nested layout */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path="home" element={<Suspense fallback={<LoadingFallback />}><LazyHome /></Suspense>} />
        <Route path="salons" element={<Suspense fallback={<LoadingFallback />}><LazySalons /></Suspense>} />
        <Route path="artisans" element={<Suspense fallback={<LoadingFallback />}><LazyHome /></Suspense>} />
        <Route path="salon/:id" element={<Suspense fallback={<LoadingFallback />}><LazySalonProfile /></Suspense>} />
        {/* <Route path="chat" element={<Suspense fallback={<LoadingFallback />}><LazyChat /></Suspense>} /> */}
        <Route path="feed" element={<Suspense fallback={<LoadingFallback />}><LazyFeed /></Suspense>} />
        <Route path="post/:id" element={<Suspense fallback={<LoadingFallback />}><LazyPostDetail /></Suspense>} />
        <Route path="jobs" element={<Suspense fallback={<LoadingFallback />}><LazyJobs /></Suspense>} />
        <Route path="appointments" element={<Suspense fallback={<LoadingFallback />}><LazyBooking /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<LoadingFallback />}><LazyProfile /></Suspense>} />
        <Route path="profile/:id" element={<Suspense fallback={<LoadingFallback />}><LazyProfileById /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<LoadingFallback />}><LazyNotifications /></Suspense>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;
