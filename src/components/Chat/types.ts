export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  type: 'salon' | 'customer';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  image?: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: UserProfile[];
  groupName?: string;
  messages: Message[];
  lastMessageAt: number;
  unreadCount: number;
}
