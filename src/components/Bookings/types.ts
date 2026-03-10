export interface Service {
  id: string;
  name: string;
  price: number;
  duration?: number;
}

export interface Stylist {
  name: string;
  role: string;
  image?: string;
  experience?: number;
}

export interface Salon {
  id: string;
  name: string;
  location: string;
  category: string;
  image: string;
  rating?: number;
  fullServices: Service[];
  stylists: Stylist[];
}

export interface Artist {
  id: string;
  name: string;
  location: string;
  image: string;
  experience: number;
  services: Array<{ label: string; id: string }>;
  rating?: number;
}

export interface Appointment {
  id: string;
  salonId: string;
  salonName: string;
  salonImage: string;
  serviceNames: string[];
  staffName: string;
  date: string;
  time: string;
  totalPrice: number;
  timestamp: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userType: 'customer' | 'salon';
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}
