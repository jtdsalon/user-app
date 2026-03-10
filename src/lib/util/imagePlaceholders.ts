/**
 * Default placeholder image URLs for salon, staff, and avatar display.
 * Used when backend returns null/undefined or when image fails to load.
 *
 * To use custom local placeholders (e.g., default_cover.png, default_avatar.png),
 * add them to public/ and set:
 *   DEFAULT_COVER_URL = '/default_cover.png'
 *   DEFAULT_AVATAR_URL = '/default_avatar.png'
 */
export const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200';

export const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=400';

export const DEFAULT_STAFF_AVATAR_URL = DEFAULT_AVATAR_URL;
