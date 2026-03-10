import React from 'react';
import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LayoutProvider } from '@/components/common/layouts/MainLayout';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import { useAuth } from '@/components/Auth/AuthContext';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const token = isAuthenticated && typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return (
    <ProtectedRoute>
      <RealtimeProvider token={token} pollIntervalMs={60000}>
        <LayoutProvider>
          <Outlet />
        </LayoutProvider>
      </RealtimeProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
