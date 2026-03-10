export const GET_ARTISANS = 'GET_ARTISANS'
export const GET_ARTISANS_SUCCESS = 'GET_ARTISANS_SUCCESS'
export const GET_ARTISANS_ERROR = 'GET_ARTISANS_ERROR'

export const GET_ARTISAN_FILTERS = 'GET_ARTISAN_FILTERS'
export const GET_ARTISAN_FILTERS_SUCCESS = 'GET_ARTISAN_FILTERS_SUCCESS'
export const GET_ARTISAN_FILTERS_ERROR = 'GET_ARTISAN_FILTERS_ERROR'

export interface Artist {
  id: string
  name: string
  role: string
  rating: number
  avatar: string
  image?: string
  specialties: string[]
  nextAvailable: string
  location: string
  isOnline: boolean
  isVerified: boolean
  activeClients: number
  clientsCount: number
  hours: string
  experience: string
  services: { label: string; color: string }[]
}

export interface ArtisanState {
  artisans: Artist[]
  artisanFilters: { jobTitles: string[] }
  pagination: { page: number; total: number; totalPages: number }
  loading: boolean
  loadingMore: boolean
  filtersLoading: boolean
  error: any
}

export const INITIAL_STATE: ArtisanState = {
  artisans: [],
  artisanFilters: { jobTitles: [] },
  pagination: { page: 1, total: 0, totalPages: 0 },
  loading: false,
  loadingMore: false,
  filtersLoading: false,
  error: null,
}

export type ArtisanAction =
  | { type: typeof GET_ARTISANS; payload?: { category?: string; job_title?: string; page?: number; limit?: number } }
  | { type: typeof GET_ARTISANS_SUCCESS; payload: { data: Artist[]; page: number; total: number; totalPages: number } }
  | { type: typeof GET_ARTISANS_ERROR; payload: any }
  | { type: typeof GET_ARTISAN_FILTERS; payload?: void }
  | { type: typeof GET_ARTISAN_FILTERS_SUCCESS; payload: { jobTitles: string[] } }
  | { type: typeof GET_ARTISAN_FILTERS_ERROR; payload: any }
