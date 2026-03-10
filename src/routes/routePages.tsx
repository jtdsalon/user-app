import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { getSalon } from '@/state/salon/getSalon';
import type { RootState } from '@/state/store';
import { useLayout } from '@/components/common/layouts/layoutContext';
import { ROUTES } from './routeConfig';

import HomeView from '@/components/Home/HomeView';
import SalonsListView from '@/components/Salons/SalonsListView';
import SalonProfileView from '@/components/Salons/SalonProfileView';
import ChatView from '@/components/Chat/ChatView';
import { FeedView } from '@/components/Feed';
import PostDetailView from '@/components/Feed/components/PostDetailView';
import JobsView from '@/components/Jobs/JobsView';
import BookingView from '@/components/Bookings/BookingView';
import ProfileView from '@/components/Profile/ProfileView';
import NotificationsView from '@/components/Notifications/NotificationsView';

export function HomePage() {
  return <HomeView />;
}

export function SalonsPage() {
  return <SalonsListView />;
}

/** Route-level data fetching: loads salon by :id before rendering */
export function SalonProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { handleOpenBooking } = useLayout();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { salon, loading } = useSelector(
    (state: RootState) => ({
      salon: (state as any).salon?.salon,
      loading: (state as any).salon?.loading,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (id) dispatch(getSalon(id) as any);
  }, [id, dispatch]);

  if (!id) return <Navigate to={ROUTES.HOME} replace />;

  if (loading && !salon) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <SalonProfileView
      salonId={id}
      onBack={() => navigate(-1)}
      onBook={(s, serviceId) => handleOpenBooking(s as any, serviceId)}
    />
  );
}

export function ChatPage() {
  return <ChatView />;
}

export function FeedPage() {
  return <FeedView />;
}

export function PostDetailPage() {
  return <PostDetailView />;
}

export function JobsPage() {
  return <JobsView />;
}

export function BookingPage() {
  return <BookingView />;
}

export function ProfilePage() {
  return <ProfileView />;
}

export function ProfileByIdPage() {
  return <ProfileView />;
}

export function NotificationsPage() {
  return <NotificationsView />;
}
