/**
 * Route Constants
 * Centralized route definitions for the application
 */

export const ROUTES = {
  // Home & Dashboard
  HOME: '/',
  DASHBOARD: '/home',

  // Artisans
  ARTISANS: '/artisans',
  ARTISAN_DETAIL: '/artisan/:id',

  // Salons
  SALONS: '/salons',
  SALON_DETAIL: '/salon/:id',
  SALON_PROFILE: '/salon/:id/profile',
  SALON_SERVICES: '/salon/:id/services',
  SALON_REVIEWS: '/salon/:id/reviews',

  // Bookings
  BOOKINGS_LIST: '/bookings',
  BOOKING_NEW: '/booking/new',
  BOOKING_DETAIL: '/booking/:id',
  BOOKING_EDIT: '/booking/:id/edit',

  // Appointments
  APPOINTMENTS: '/appointments',
  JOURNALS: '/journals',
  APPOINTMENT_DETAIL: '/appointment/:id',

  // Products
  PRODUCTS: '/products',
  COLLECTION: '/collection',
  PRODUCT_DETAIL: '/product/:id',

  // Cart & Checkout
  CART: '/cart',
  CHECKOUT: '/checkout',

  // Feed & Archive
  FEED: '/feed',
  ARCHIVE: '/archive',
  POST_DETAIL: '/post/:id',

  // Chat & Messages
  CHAT: '/chat',
  CHAT_CONVERSATION: '/chat/:conversationId',
  MESSAGES: '/messages',

  // Consultant & Guide
  CONSULTANT: '/consultant',
  GUIDE: '/guide',
  AI_CHAT: '/ai-chat',

  // Notifications
  NOTIFICATIONS: '/notifications',
  ACTIVITY: '/activity',

  // Profile
  PROFILE: '/profile',
  PROFILE_VIEW: '/profile/:userId',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_SETTINGS: '/profile/settings',

  // Authentication
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password/:token',

  // Search
  SEARCH: '/search',
  SEARCH_QUERY: '/search/:query',

  // Favorites
  FAVORITES: '/favorites',
  FAVORITES_SALONS: '/favorites/salons',
  FAVORITES_ARTISANS: '/favorites/artisans',
  FAVORITES_PRODUCTS: '/favorites/products',

  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: '/order/:id',

  // Reviews
  REVIEWS: '/reviews',
  REVIEW_NEW: '/review/new/:salonId',
  REVIEW_DETAIL: '/review/:id',
} as const;

/**
 * Helper function to generate route paths with parameters
 * Usage: generatePath(ROUTES.SALON_DETAIL, { id: '123' })
 */
export const generatePath = (template: string, params: Record<string, string | number>): string => {
  let path = template;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value));
  });
  return path;
};

/**
 * Navigation helper for common routes
 */
export const navigate = {
  home: () => ROUTES.HOME,
  artisans: () => ROUTES.ARTISANS,
  artisan: (id: string | number) => generatePath(ROUTES.ARTISAN_DETAIL, { id }),
  salons: () => ROUTES.SALONS,
  salon: (id: string | number) => generatePath(ROUTES.SALON_DETAIL, { id }),
  salonProfile: (id: string | number) => generatePath(ROUTES.SALON_PROFILE, { id }),
  salonServices: (id: string | number) => generatePath(ROUTES.SALON_SERVICES, { id }),
  salonReviews: (id: string | number) => generatePath(ROUTES.SALON_REVIEWS, { id }),
  bookings: () => ROUTES.BOOKINGS_LIST,
  bookingNew: () => ROUTES.BOOKING_NEW,
  booking: (id: string | number) => generatePath(ROUTES.BOOKING_DETAIL, { id }),
  bookingEdit: (id: string | number) => generatePath(ROUTES.BOOKING_EDIT, { id }),
  appointments: () => ROUTES.APPOINTMENTS,
  journals: () => ROUTES.JOURNALS,
  appointment: (id: string | number) => generatePath(ROUTES.APPOINTMENT_DETAIL, { id }),
  products: () => ROUTES.PRODUCTS,
  collection: () => ROUTES.COLLECTION,
  product: (id: string | number) => generatePath(ROUTES.PRODUCT_DETAIL, { id }),
  cart: () => ROUTES.CART,
  checkout: () => ROUTES.CHECKOUT,
  feed: () => ROUTES.FEED,
  archive: () => ROUTES.ARCHIVE,
  post: (id: string | number) => generatePath(ROUTES.POST_DETAIL, { id }),
  chat: () => ROUTES.CHAT,
  chatConversation: (conversationId: string | number) => generatePath(ROUTES.CHAT_CONVERSATION, { conversationId }),
  messages: () => ROUTES.MESSAGES,
  consultant: () => ROUTES.CONSULTANT,
  guide: () => ROUTES.GUIDE,
  aiChat: () => ROUTES.AI_CHAT,
  notifications: () => ROUTES.NOTIFICATIONS,
  activity: () => ROUTES.ACTIVITY,
  profile: () => ROUTES.PROFILE,
  profileView: (userId: string | number) => generatePath(ROUTES.PROFILE_VIEW, { userId }),
  profileEdit: () => ROUTES.PROFILE_EDIT,
  profileSettings: () => ROUTES.PROFILE_SETTINGS,
  login: () => ROUTES.LOGIN,
  signup: () => ROUTES.SIGNUP,
  register: () => ROUTES.REGISTER,
  forgotPassword: () => ROUTES.FORGOT_PASSWORD,
  resetPassword: (token: string) => generatePath(ROUTES.RESET_PASSWORD, { token }),
  search: () => ROUTES.SEARCH,
  searchQuery: (query: string) => generatePath(ROUTES.SEARCH_QUERY, { query }),
  favorites: () => ROUTES.FAVORITES,
  favoritesSalons: () => ROUTES.FAVORITES_SALONS,
  favoritesArtisans: () => ROUTES.FAVORITES_ARTISANS,
  favoritesProducts: () => ROUTES.FAVORITES_PRODUCTS,
  orders: () => ROUTES.ORDERS,
  order: (id: string | number) => generatePath(ROUTES.ORDER_DETAIL, { id }),
  reviews: () => ROUTES.REVIEWS,
  reviewNew: (salonId: string | number) => generatePath(ROUTES.REVIEW_NEW, { salonId }),
  review: (id: string | number) => generatePath(ROUTES.REVIEW_DETAIL, { id }),
};
