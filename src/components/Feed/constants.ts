import { FeedPost } from './types';

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'f1',
    userId: '1',
    userName: 'Elysian Beauty House',
    userAvatar: undefined,
    userType: 'salon',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop',
    imageBefore: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=800&auto=format&fit=crop',
    isTransformation: true,
    caption: 'A study in elegance. Our Master Stylist @petra worked her magic on this winter blonde. ✨',
    likes: 89,
    timeAgo: 'Just now',
    comments: [
      {
        id: 'c1',
        userId: 'u1',
        userName: 'Ana Rivera',
        userAvatar: undefined,
        userType: 'customer',
        text: 'Absolutely stunning! @petra never disappoints ✨',
        timeAgo: '1h ago',
        likes: 5,
        isLiked: false,
      },
    ]
  },
  {
    id: 'f2',
    userId: 'u_me', 
    userName: 'Jane Doe',
    userAvatar: undefined,
    userType: 'customer',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    caption: 'The weekend glow is real. Thanks @serenity_salon for the amazing experience!',
    likes: 34,
    timeAgo: '2h ago',
    comments: []
  },
  {
    id: 'f3',
    userId: '3',
    userName: 'Royal Palace Spa',
    userAvatar: undefined,
    image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6eef45?q=80&w=800&auto=format&fit=crop',
    userType: 'salon',
    caption: 'Art is everywhere. Shoutout to @aurum_aesthetics for the signature ritual.',
    likes: 121,
    timeAgo: '5h ago',
    comments: []
  }
];
