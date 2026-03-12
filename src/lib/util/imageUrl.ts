import { getServerOrigin } from '@/config/api'

/**
 * Constructs a full image URL from a relative path
 * @param imagePath - Relative image path from the API response (e.g., /uploads/salons/...)
 * @returns Full URL to the image
 */
export const getFullImageUrl = (imagePath: string | undefined | null): string | undefined => {
  // Handle null, undefined, or non-string values
  if (!imagePath || typeof imagePath !== 'string') {
    return undefined
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // If path contains an embedded full URL (e.g. /uploads/http://...), extract and return it
  const embeddedUrl = imagePath.match(/https?:\/\/[^\s'"]+/)
  if (embeddedUrl) {
    return embeddedUrl[0]
  }

  return `${getServerOrigin()}${imagePath}`
}

/**
 * Constructs full URLs for both avatar and cover images
 * @param salon - Salon object with avatar/cover or image/coverImage properties
 * @returns Object with fullAvatarUrl and fullCoverUrl
 */
export const getSalonImageUrls = (salon: any) => {
  const avatar = salon?.image || salon?.avatar || salon?.image_url || salon?.profile_image
  const cover = salon?.coverImage || salon?.cover_image_url || salon?.cover
  return {
    fullAvatarUrl: getFullImageUrl(avatar),
    fullCoverUrl: getFullImageUrl(cover),
  }
}
