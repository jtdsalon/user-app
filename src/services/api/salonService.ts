import { AxiosResponse } from 'axios'

function formatHoursForDisplay(hours: any): string {
  if (!hours) return 'N/A'
  if (typeof hours === 'string') return hours
  if (Array.isArray(hours)) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todayHours = hours.find((h: any) => (h.day || '').toLowerCase() === today)
    if (todayHours?.isOpen) return `${todayHours.open || '—'} - ${todayHours.close || '—'}`
    const first = hours.find((h: any) => h.isOpen)
    return first ? `${first.day} ${first.open}-${first.close}` : 'Closed'
  }
  if (typeof hours === 'object') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const val = hours[today] ?? hours[today.slice(0, 3)]
    if (val && val !== 'Closed') return String(val)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const first = days.find(d => hours[d] && hours[d] !== 'Closed')
    return first ? String(hours[first]) : 'N/A'
  }
  return 'N/A'
}
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import { GET_SALONS_URL, GET_SALON_DETAIL_URL, FOLLOW_SALON_URL, UNFOLLOW_SALON_URL, FOLLOW_PAGE_URL, UNFOLLOW_PAGE_URL } from './endPoints'
import { GET_SALON_CATEGORIES_URL, GET_SALONS_BY_CATEGORY_URL, GET_SALONS_CURSOR_URL } from './endPoints'

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function getSalonsApi(page = 1, limit = 10): Promise<AxiosResponse<PaginatedResponse<any>>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SALONS_URL,
    params: { page, limit }
  })
}

export function getSalonApi(salonId: string): Promise<AxiosResponse<any>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SALON_DETAIL_URL.replace('{salonId}', salonId)
  })
}

// Fetch available salon categories
export function getSalonCategoriesApi(): Promise<AxiosResponse<string[]>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SALON_CATEGORIES_URL,
  })
}

// Fetch salons for a given category (legacy offset/page). Optional gender filters results.
export function getSalonsByCategoryApi(
  category: string,
  page = 1,
  limit = 8,
  gender?: 'ladies' | 'men' | 'all' | null
): Promise<AxiosResponse<PaginatedResponse<any>>> {
  const params: Record<string, string | number> = { category, page, limit }
  if (gender) params.gender = gender
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SALONS_BY_CATEGORY_URL,
    params: params
  })
}

// Cursor-based fetching for pagination (recommended)
export function getSalonsCursorApi(category?: string, cursor?: string | null, limit = 20): Promise<AxiosResponse<any>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SALONS_CURSOR_URL,
    params: { category, cursor, limit }
  })
}

export function followSalonApi(salonId: string): Promise<AxiosResponse<{ data: { followed: boolean } }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: FOLLOW_SALON_URL.replace('{salonId}', salonId)
  })
}

export function unfollowSalonApi(salonId: string): Promise<AxiosResponse<{ data: { followed: boolean } }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: UNFOLLOW_SALON_URL.replace('{salonId}', salonId)
  })
}

/** Follow a page by page ID (when only page_id is available, e.g. from feed). Returns salonId for favorites sync. */
export function followPageApi(pageId: string): Promise<AxiosResponse<{ data: { followed: boolean; salonId: string } }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: FOLLOW_PAGE_URL.replace('{pageId}', pageId)
  })
}

/** Unfollow a page by page ID. Returns salonId for favorites sync. */
export function unfollowPageApi(pageId: string): Promise<AxiosResponse<{ data: { followed: boolean; salonId: string } }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: UNFOLLOW_PAGE_URL.replace('{pageId}', pageId)
  })
}

// Normalizer: map backend salon to app Salon shape expected by UI
export const normalizeSalon = (raw: any) => {
  if (!raw) return null
  const mapService = (s: any) => ({
    id: String(s.id || s.serviceId || s._id || ''),
    name: s.name || s.serviceName || s.title || '',
    price: Number(s.price || 0),
    duration: typeof s.duration === 'string' ? parseInt(s.duration, 10) || 0 : Number(s.duration || s.duration_minutes || 0),
    category: s.category || '',
    description: s.description || s.desc || ''
  })

  const normalizeStylist = (st: any) => {
    const name = st.name || st.display_name || st.fullName || ''
    const image = st.image || st.avatar || st.image_url || st.profile_image || ''
    return {
      id: String(st.id || st.staffId || st._id || name || ''),
      name,
      initials: (name.split(' ').map((n: string) => (n ? n[0] : '')).join('').slice(0, 2) || '--').toUpperCase(),
      image,
      role: st.role || st.job_title || st.position || 'Stylist'
    }
  }

  const rawHours = raw.hours ?? raw.operatingHours ?? raw.operating_hours
  const hoursDisplay = formatHoursForDisplay(rawHours)

  const salon = {
    id: String(raw.id || raw._id || ''),
    name: raw.name || raw.title || '',
    location: raw.location || raw.address || raw.city || '',
    rating: Number(raw.rating || raw.average_rating || raw.avgRating || 0),
    image: raw.image || raw.avatar || raw.image_url || raw.profile_image || '',
    coverImage: raw.cover_image_url || raw.cover || raw.coverImage || '',
    category: raw.category || 'General',
    description: raw.description || raw.desc || '',
    bio: raw.bio || raw.meta?.bio || '',
    experience: raw.experience || raw.years || '',
    nextAvailable: raw.nextAvailable || raw.next_available || 'TBD',
    priceRange: raw.priceRange || '',
    status: raw.status || 'online',
    clients: Number(raw.clients || raw.clientCount || raw.total_clients || 0),
    fullServices: Array.isArray(raw.services || raw.fullServices) ? (raw.services || raw.fullServices).map(mapService) : [],
    isVerified: !!raw.is_verified || !!raw.isVerified,
    hours: hoursDisplay,
    hoursRaw: rawHours,
    socials: raw.socials ?? {},
    servicesCount: Number(raw.servicesCount || raw.total_services || (raw.services || []).length || 0),
    stylists: Array.isArray(raw.stylists || raw.staff) ? (raw.stylists || raw.staff).map(normalizeStylist) : [],
    offers: raw.offers || [],
    reviews: raw.reviews || [],
    branches: raw.branches || []
  }
  return salon
}

export const normalizeSalonList = (arr: any[]) => (Array.isArray(arr) ? arr.map(normalizeSalon).filter(Boolean) : [])
