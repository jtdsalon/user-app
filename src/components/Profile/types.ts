export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  type: 'salon' | 'customer';
  isFollowing?: boolean;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  userType: 'salon' | 'customer';
  image: string;
  caption: string;
  timestamp: number;
  likes: number;
  comments: number;
  liked?: boolean;
  salonId?: string;
  beforeImage?: string;
  afterImage?: string;
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
  likes: number;
}
