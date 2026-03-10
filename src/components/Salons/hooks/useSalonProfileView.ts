import { useMemo, useState, useCallback } from 'react';
import { useTheme } from '@mui/material';
import type { Salon, SalonReview, SalonService, FeedPost } from '@/components/Home/types';
import { useSalonProfileAction } from './useSalonProfileAction';
import { createReviewApi } from '@/services/api/reviewService';

/**
 * useSalonProfileView encapsulates Salon profile data fetching, state, and actions.
 */
export function useSalonProfileView(salonId: string) {
  const theme = useTheme();
  const { salon, loading, error, reviews, refetchReviews } = useSalonProfileAction(salonId);

  const [tabValue, setTabValue] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    service: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const salonPosts = useMemo<FeedPost[]>(() => [], []);
  const localReviews = reviews;

  const currentRating = useMemo(() => {
    if (localReviews.length === 0) return 0;
    const total = localReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((total / localReviews.length).toFixed(1));
  }, [localReviews]);

  const groupedServices = useMemo(() => {
    if (!salon?.fullServices) return {} as Record<string, SalonService[]>;
    return salon.fullServices.reduce((acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, SalonService[]>);
  }, [salon?.fullServices]);

  const openExternalLink = useCallback((rawUrl?: string | null) => {
    if (!rawUrl) return;

    let url = rawUrl.trim();
    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // best effort only
    }
  }, []);

  const profileShareUrl =
    (salon?.socials?.website && salon.socials.website.trim()) ||
    (typeof window !== 'undefined' ? window.location.href : '');

  const handleAddReview = useCallback(async () => {
    if (!salon) return;

    const comment = newReview.comment.trim();
    if (!comment || comment.length < 3) return;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const serviceId = salon.fullServices.find(s => s.name === newReview.service)?.id;
      await createReviewApi({
        salon_id: salonId,
        rating: newReview.rating,
        comment: comment,
        title: 'Reflection',
        ...(serviceId && { service_id: serviceId }),
      });
      refetchReviews();
      setIsReviewModalOpen(false);
      setNewReview({ rating: 5, comment: '', service: '' });
    } catch (err: any) {
      const data = err?.response?.data;
      const firstError = data?.errors?.[0];
      const message = firstError?.message || data?.message || err?.message || 'Failed to post review';
      setReviewError(message);
    } finally {
      setSubmittingReview(false);
    }
  }, [newReview, refetchReviews, salon, salonId]);

  return {
    theme,
    salon,
    loading,
    error,
    reviews: localReviews as SalonReview[],
    refetchReviews,
    tabValue,
    setTabValue,
    isReviewModalOpen,
    setIsReviewModalOpen,
    newReview,
    setNewReview,
    submittingReview,
    reviewError,
    setReviewError,
    isShareOpen,
    setIsShareOpen,
    salonPosts,
    currentRating,
    groupedServices,
    openExternalLink,
    profileShareUrl,
    handleAddReview,
  };
}

