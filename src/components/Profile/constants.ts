import { FeedPost } from './types';

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'p1',
    userId: 'u_me',
    userName: 'Jane Doe',
    userHandle: '@janedoe_aesthetic',
    userAvatar: '',
    userType: 'customer',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
    caption: 'Radiant skin is a mood. Just finished my morning ritual with the new luminous serum. The glow is unreal. ✨',
    timestamp: Date.now() - 86400000,
    likes: 234,
    comments: 12,
    liked: false
  },
  {
    id: 'p2',
    userId: 'u_me',
    userName: 'Jane Doe',
    userHandle: '@janedoe_aesthetic',
    userAvatar: '',
    userType: 'customer',
    image: 'https://images.unsplash.com/photo-1570545338259-3275403ad28e?w=600&h=600&fit=crop',
    caption: 'Golden hour, golden skin. My transformation journey with Sarah Master at Elysian Beauty has been nothing short of magical.',
    timestamp: Date.now() - 172800000,
    likes: 456,
    comments: 34,
    liked: true,
    salonId: 's1'
  },
  {
    id: 'p3',
    userId: 'u_sophia',
    userName: 'Sophia Grace',
    userHandle: '@sophia_rituals',
    userAvatar: '',
    userType: 'customer',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop',
    caption: 'The ritual is everything. Skincare is self-love in a bottle.',
    timestamp: Date.now() - 259200000,
    likes: 892,
    comments: 67,
    liked: false
  },
  {
    id: 'p4',
    userId: 'u_me',
    userName: 'Jane Doe',
    userHandle: '@janedoe_aesthetic',
    userAvatar: '',
    userType: 'customer',
    image: 'https://images.unsplash.com/photo-1561746015-f2744e25d63c?w=600&h=600&fit=crop',
    caption: 'Minimalist skincare routine that actually works. Less is more, always.',
    timestamp: Date.now() - 345600000,
    likes: 567,
    comments: 45,
    liked: false
  },
  {
    id: 'p5',
    userId: 'u_sophia',
    userName: 'Sophia Grace',
    userHandle: '@sophia_rituals',
    userAvatar: '',
    userType: 'customer',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=600&fit=crop',
    caption: 'Fresh, dewy, glowing. That\'s the aesthetic we\'re chasing.',
    timestamp: Date.now() - 432000000,
    likes: 723,
    comments: 56,
    liked: false
  },
  {
    id: 'p6',
    userId: 'u_me',
    userName: 'Jane Doe',
    userHandle: '@janedoe_aesthetic',
    userAvatar: '',
    userType: 'customer',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
    caption: 'Beauty is confidence. And confidence is taking care of your skin.',
    timestamp: Date.now() - 518400000,
    likes: 345,
    comments: 23,
    liked: false
  }
];
