/** Base path for the app (must match Vite base in vite.config). No trailing slash. */
export const BASE_PATH = (import.meta.env.BASE_URL ?? '/user-app/').replace(/\/+$/, '') || ''

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
