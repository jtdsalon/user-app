// Salon and related types
export interface SalonBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
}

export interface SalonService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  // alternate / API-backed fields
  serviceId?: string;
  serviceName?: string;
  title?: string;
}

export interface SalonStylist {
  id: string;
  name: string;
  initials: string;
  role: string;
  specialization?: string;
  // alternate / API-backed fields
  staffId?: string;
}

export interface SalonOffer {
  id: string;
  title: string;
  description: string;
  code?: string | null;
  discountPercentage?: number;
  expiresAt?: string;
}

export interface SalonReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  serviceAttended?: string;
}

export interface Salon {
  id: string;
  name: string;
  image: string;
  coverImage: string;
  location: string;
  status: 'online' | 'offline';
  isVerified: boolean;
  rating: number;
  reviews: SalonReview[];
  clients: number;
  experience: string;
  fullServices: SalonService[];
  branches: SalonBranch[];
  stylists: SalonStylist[];
  offers: SalonOffer[];
  // optional fields returned by feed/detail APIs
  address?: string;
  category?: string;
  salonCategory?: string;
  profileImage?: string;
  profile_image?: string;
  openingTime?: string;
  opening_time?: string;
  closingTime?: string;
  closing_time?: string;
  socials?: any;
  // flattened arrays from feed query
  services?: SalonService[];
  totalServices?: number;
  total_services?: number;
  staff?: SalonStylist[];
  totalStaff?: number;
  total_staff?: number;
  totalClients?: number;
  total_clients?: number;
  average_rating?: number | string;
  averageRating?: number | string;
  nextAvailable?: string;
  next_available?: string;
  servicesCount?: number;
}

// Feed Post types
export interface FeedPostUser {
  id: string;
  name: string;
  avatar: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  userType: 'user' | 'salon';
  user?: FeedPostUser;
  content: string;
  image?: string;
  images?: string[];
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface SalonProfileViewProps {
  salonId: string;
  onBack: () => void;
  onBook: (salon: Salon) => void;
}
