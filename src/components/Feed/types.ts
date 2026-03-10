export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userType: 'customer' | 'salon' | 'page';
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userType: 'customer' | 'salon' | 'page';
  /** For page posts: salon ID to use for follow/navigation */
  authorSalonId?: string | null;
  caption?: string;
  image?: string;
  imageBefore?: string;
  isTransformation?: boolean;
  /** Category for filtering (skincare, hair, nails, makeup, wellness) */
  category?: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  repostsCount?: number;
  parentPost?: FeedPost | null;
  comments: Comment[];
}
