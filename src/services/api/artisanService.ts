import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import { GET_ARTISANS_URL, GET_ARTISAN_FILTERS_URL } from './endPoints'
import type { Artist } from '../components/Artists/types'

interface PaginatedResponse<T> {
  data: T[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export function getArtisansApi(params?: {
  category?: string
  job_title?: string
  page?: number
  limit?: number
}): Promise<{ data: PaginatedResponse<Artist> }> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_ARTISANS_URL,
    params: params || {},
  })
}

export function getArtisanFiltersApi(): Promise<{ data: { jobTitles: string[] } }> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_ARTISAN_FILTERS_URL,
  })
}

export function normalizeArtisan(raw: any): Artist {
  const salon = raw.salon || {}
  return {
    id: String(raw.id || ''),
    name: raw.name || raw.display_name || 'Unknown',
    role: raw.role || raw.job_title || 'Specialist',
    rating: Number(raw.rating || raw.rating_cached || 0),
    avatar: raw.avatar || raw.avatar_url || raw.image || '',
    image: raw.image || raw.avatar || raw.avatar_url || '',
    specialties: Array.isArray(raw.specialties) ? raw.specialties : [raw.role || raw.job_title || ''],
    nextAvailable: raw.nextAvailable || raw.next_available || 'TBD',
    location: raw.location || raw.address || salon.address || salon.name || '',
    isOnline: raw.isOnline ?? raw.is_active ?? true,
    isVerified: true,
    activeClients: Number(raw.activeClients || raw.active_clients || 0),
    clientsCount: Number(raw.clientsCount || raw.clients_count || 0),
    hours: raw.hours || '10AM - 6PM',
    experience: raw.experience || 'Expert',
    services: Array.isArray(raw.services) ? raw.services : [],
    salonId: raw.salon_id || salon?.id || null,
    salonName: salon?.name || raw.salonName || null,
  }
}
