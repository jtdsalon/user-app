/**
 * User-specific localStorage keys to clear on logout.
 * Excludes: glow_theme_mode (UI preference, not user data)
 */
const USER_STORAGE_KEYS = [
  'token',
  'user',
  'luxe_favs',
  'luxe_follows',
  'luxe_cart',
  'aurora_chats',
  'luxe_applied_jobs',
  'luxe_bookings',
  'luxe_booking_notes',
] as const

export function clearUserStorage(): void {
  USER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}
