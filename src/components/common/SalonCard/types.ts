export type ViewType = 'home' | 'collection' | 'consultant' | 'chat' | 'feed' | 'appointments' | 'profile' | 'notifications' | 'salon-profile' | 'all-salons' | 'all-artisans' | 'jobs';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  type: 'customer' | 'salon' | 'artist' | 'user';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userType: 'salon' | 'artist' | 'user' | 'customer';
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userType: 'salon' | 'artist' | 'user' | 'customer';
  image?: string;
  imageBefore?: string;
  isTransformation?: boolean;
  caption: string;
  likes: number;
  isLiked?: boolean;
  comments: Comment[];
  timeAgo: string;
}

export interface SalonService {
  id: string;
  name: string;
  serviceId?: string;   // API alternate field
  serviceName?: string; // API alternate field
  price: number;
  duration: string;
  category: string;
  description?: string;
}

export interface Stylist {
  id: string;
  name: string;
  initials: string;
  image?: string;
  role?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  badge?: string;
  end_date?: string | null;
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

export interface SalonBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
}

export interface SalonSocials {
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  twitter?: string | null;
  [key: string]: string | undefined | null;
}

export interface Salon {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  coverImage?: string;
  category: string;
  description: string;
  experience?: string;
  nextAvailable: string;
  priceRange: string;
  status: 'online' | 'offline';
  clients: number;
  fullServices: SalonService[];
  isVerified: boolean;
  hours: string;
  socials?: SalonSocials;
  servicesCount: number;
  stylists: Stylist[];
  offers: Offer[];
  reviews: SalonReview[];
  branches: SalonBranch[];
}

export interface ArtistService {
  label: string;
  color: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  image?: string;
  specialties: string[];
  nextAvailable: string;
  location: string;
  isOnline: boolean;
  isVerified: boolean;
  activeClients: number;
  clientsCount: number;
  hours: string;
  experience: string;
  services: ArtistService[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  fromUserName: string;
  fromUserAvatar: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
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
  status?: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  images?: string[];
}

export interface BookingState {
  salon: Salon | null;
  artist: Artist | null;
  isOpen: boolean;
}

export interface LayoutContextType {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  lastBooked: Salon | null;
  handleOpenBooking: (salon: Salon) => void;
  handleOpenArtistBooking: (artist: Artist) => void;
  setIsSmartBookingOpen: (open: boolean) => void;
  isLoading: boolean;
}