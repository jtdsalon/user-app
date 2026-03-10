/** Canonical paths for user app. Use these for navigation. */
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/home',
  SALONS: '/salons',
  ARTISANS: '/artisans',
  CHAT: '/chat',
  FEED: '/feed',
  POST_DETAIL: '/post/:id',
  JOBS: '/jobs',
  SALON: '/salon',
  APPOINTMENTS: '/appointments',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
} as const;

/** Path pattern for dynamic salon route (use with :id) */
export const SALON_PATH = '/salon/:id';
