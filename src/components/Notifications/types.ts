/** All notification types supported by the app */
export type NotificationType =
  | 'like'
  | 'comment'
  | 'reply_to_comment'
  | 'post_shared'
  | 'saved_post'
  | 'follow'
  | 'favorites_milestone'
  | 'circle_activity'
  | 'mention'
  | 'tagged_in_post'
  | 'salon_post_update'
  | 'new_service_announcement'
  | 'staff_showcase'
  | 'promotion'
  | 'trending_post'
  | 'recommended_users'
  | 'suggested_salons'
  | 'post_approved'
  | 'post_removed'
  | 'profile_update_reminder'
  | 'booking_new'
  | 'booking_confirmed'
  | 'booking_rescheduled'
  | 'booking_cancelled'
  | 'cancellation_customer'
  | 'cancellation_salon'
  | 'cancellation_system'
  | 'job_application_new'
  | 'job_application_approved'
  | 'job_application_rejected'
  | 'review_new'
  | 'rating_new'
  | 'reply_to_review';

export interface Notification {
  id: string;
  type: NotificationType | string;
  title?: string;
  message: string;
  fromUserId?: string;
  postId?: string;
  commentId?: string;
  bookingId?: string | null;
  jobId?: string | null;
  reviewId?: string | null;
  metadata?: Record<string, unknown>;
  fromUserName: string;
  fromUserAvatar: string | null;
  timeAgo: string;
  isRead: boolean;
  createdAt?: string | null;
  timestamp?: number;
  navigationTarget?: string | null;
}
