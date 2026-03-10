import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { Sparkles, MessageCircle, UserPlus, AtSign, Bell, Share2, Bookmark, Store, TrendingUp, AlertCircle, CheckCircle, Calendar, Briefcase } from 'lucide-react';
import { Notification } from '../types';
import { getNotificationStrings } from '../properties';
import { useRealtime } from '@/contexts/RealtimeContext';
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  clearAllNotificationsApi,
  deleteNotificationApi,
} from '@/services/api/notificationsService';

function mapApiToNotification(raw: any, fallbacks: { someone: string; justNow: string }): Notification {
  return {
    id: raw.id,
    type: raw.type || 'system',
    title: raw.title,
    message: raw.message || '',
    fromUserId: raw.fromUserId,
    postId: raw.postId,
    commentId: raw.commentId,
    bookingId: raw.bookingId ?? null,
    jobId: raw.jobId ?? null,
    reviewId: raw.reviewId ?? null,
    metadata: raw.metadata,
    fromUserName: raw.fromUserName || fallbacks.someone,
    fromUserAvatar: raw.fromUserAvatar ?? null,
    timeAgo: raw.timeAgo || fallbacks.justNow,
    isRead: !!raw.isRead,
    createdAt: raw.createdAt ?? null,
    timestamp: raw.timestamp,
    navigationTarget: raw.navigationTarget ?? null,
  };
}

export function useNotificationsAction() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getNotificationsApi(1, 100);
      const body = (res?.data as any) ?? {};
      const data = Array.isArray(body) ? body : body?.data;
      const list = Array.isArray(data) ? data : [];
      const { fallbacks } = getNotificationStrings();
      setNotifications(list.map((r) => mapApiToNotification(r, fallbacks)));
    } catch (err: any) {
      console.error('Fetch notifications failed', err);
      setNotifications([]);
      const msg = err?.errorMessage || err?.message || 'Failed to load notifications';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const realtime = useRealtime();
  useEffect(() => {
    if (!realtime) return;
    return realtime.subscribe('notification_new', () => {
      fetchNotifications();
    });
  }, [realtime, fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    switch (tabValue) {
      case 1:
        return notifications.filter((n) =>
          ['booking_new', 'booking_confirmed', 'booking_rescheduled', 'booking_cancelled', 'cancellation_customer', 'cancellation_salon', 'cancellation_system'].includes(n.type)
        );
      case 2:
        return notifications.filter((n) =>
          ['job_application_new', 'job_application_approved', 'job_application_rejected'].includes(n.type)
        );
      case 3:
        return notifications.filter((n) =>
          ['review_new', 'rating_new', 'reply_to_review'].includes(n.type)
        );
      case 4:
        return notifications.filter((n) =>
          ['like', 'comment', 'follow', 'mention', 'reply_to_comment', 'post_shared', 'saved_post', 'trending_post', 'salon_post_update', 'new_service_announcement', 'staff_showcase', 'promotion', 'post_approved', 'post_removed', 'profile_update_reminder'].includes(n.type)
        );
      default:
        return notifications;
    }
  }, [notifications, tabValue]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Mark all read failed', e);
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    try {
      await clearAllNotificationsApi();
      setNotifications([]);
    } catch (e) {
      console.error('Clear all failed', e);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error('Delete notification failed', e);
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notif: Notification) => {
      if (!notif.isRead) {
        try {
          await markNotificationReadApi(notif.id);
        } catch (_) {}
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      }
      if (notif.navigationTarget) {
        navigate(notif.navigationTarget);
      } else if (notif.bookingId) {
        navigate(`/appointments`);
      } else if (notif.jobId) {
        navigate(`/jobs`);
      } else if (notif.postId) {
        navigate(`/post/${notif.postId}`);
      } else if (notif.reviewId) {
        navigate(`/feed`);
      } else if (notif.type === 'follow' && notif.fromUserId) {
        navigate(`/profile/${notif.fromUserId}`);
      } else if (notif.fromUserId) {
        navigate(`/profile/${notif.fromUserId}`);
      }
    },
    [navigate]
  );

  const getNotifIcon = useCallback(
    (type: string) => {
      switch (type) {
        case 'booking_new':
        case 'booking_confirmed':
        case 'booking_rescheduled':
        case 'booking_cancelled':
        case 'cancellation_customer':
        case 'cancellation_salon':
        case 'cancellation_system':
          return <Calendar size={14} color={theme.palette.secondary.main} />;
        case 'job_application_new':
        case 'job_application_approved':
        case 'job_application_rejected':
          return <Briefcase size={14} color="#06B6D4" />;
        case 'review_new':
        case 'rating_new':
        case 'reply_to_review':
          return <Sparkles size={14} color="#F59E0B" />;
        case 'like':
        case 'trending_post':
          return <Sparkles size={14} color={theme.palette.secondary.main} fill={theme.palette.secondary.main} />;
        case 'comment':
        case 'reply_to_comment':
          return <MessageCircle size={14} color="#4F46E5" />;
        case 'post_shared':
          return <Share2 size={14} color="#8B5CF6" />;
        case 'saved_post':
          return <Bookmark size={14} color="#F59E0B" />;
        case 'follow':
        case 'favorites_milestone':
        case 'circle_activity':
          return <UserPlus size={14} color="#10B981" />;
        case 'mention':
        case 'tagged_in_post':
          return <AtSign size={14} color={theme.palette.text.primary} />;
        case 'salon_post_update':
        case 'new_service_announcement':
        case 'staff_showcase':
        case 'promotion':
          return <Store size={14} color="#06B6D4" />;
        case 'recommended_users':
        case 'suggested_salons':
          return <TrendingUp size={14} color="#6366F1" />;
        case 'post_approved':
          return <CheckCircle size={14} color="#10B981" />;
        case 'post_removed':
        case 'profile_update_reminder':
          return <AlertCircle size={14} color="#F59E0B" />;
        default:
          return <Bell size={14} />;
      }
    },
    [theme]
  );

  return {
    notifications,
    loading,
    tabValue,
    setTabValue,
    filteredNotifications,
    fetchNotifications,
    fetchError,
    handleMarkAllRead,
    handleClearAll,
    handleDelete,
    handleNotificationClick,
    getNotifIcon,
  };
}
