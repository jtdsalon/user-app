// ...new file...

// Salon Action Types
export const GET_SALONS = 'GET_SALONS'
export const GET_SALONS_SUCCESS = 'GET_SALONS_SUCCESS'
export const GET_SALONS_ERROR = 'GET_SALONS_ERROR'

export const GET_SALON_CATEGORIES = 'GET_SALON_CATEGORIES'
export const GET_SALON_CATEGORIES_SUCCESS = 'GET_SALON_CATEGORIES_SUCCESS'
export const GET_SALON_CATEGORIES_ERROR = 'GET_SALON_CATEGORIES_ERROR'

export const GET_SALON = 'GET_SALON'
export const GET_SALON_SUCCESS = 'GET_SALON_SUCCESS'
export const GET_SALON_ERROR = 'GET_SALON_ERROR'

export const GET_SALONS_BY_CATEGORY = 'GET_SALONS_BY_CATEGORY'
export const GET_SALONS_BY_CATEGORY_SUCCESS = 'GET_SALONS_BY_CATEGORY_SUCCESS'
export const GET_SALONS_BY_CATEGORY_ERROR = 'GET_SALONS_BY_CATEGORY_ERROR'

export const GET_SALON_DETAIL = 'GET_SALON_DETAIL'
export const GET_SALON_DETAIL_SUCCESS = 'GET_SALON_DETAIL_SUCCESS'
export const GET_SALON_DETAIL_ERROR = 'GET_SALON_DETAIL_ERROR'

export interface Salon {
  id: string
  name: string
  category?: string
  description?: string
  address?: string
  latitude?: number
  longitude?: number
  image_url?: string
  cover_image_url?: string
  socials?: Record<string, string>
  hours?: Record<string, any>
  meta?: Record<string, any>
  is_verified?: boolean
  sponsored?: boolean
  is_active?: boolean
  [key: string]: any
}

export interface PaginationState {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SalonDetail {
  id: string
  name: string
  location: string
  rating: number
  image: string
  coverImage?: string
  category: string
  description: string
  experience?: string
  nextAvailable: string
  priceRange: string
  status: 'online' | 'offline'
  clients: number
  fullServices: any[]
  isVerified: boolean
  hours: string
  servicesCount: number
  stylists: any[]
  offers: any[]
  reviews: any[]
  branches: any[]
}

export interface SalonState {
  salons: Salon[]
  salonsByCategory: Salon[]
  salonsByCategoryMap: Record<string, Salon[]>
  categoryPagination: Record<string, { page: number; total: number; totalPages: number }>
  salon: Salon | null
  salonDetail: SalonDetail | null
  salonDetailLoading: boolean
  salonDetailError: string | null
  categories: string[]
  pagination: PaginationState
  loading: boolean
  categoriesLoading: boolean
  salonsByCategoryLoading: boolean
  loadingMoreCategory: string | null
  error: any
}

export const INITIAL_STATE: SalonState = {
  salons: [],
  salonsByCategory: [],
  salonsByCategoryMap: {},
  categoryPagination: {},
  salon: null,
  salonDetail: null,
  salonDetailLoading: false,
  salonDetailError: null,
  categories: [],
  pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
  loading: false,
  categoriesLoading: false,
  salonsByCategoryLoading: false,
  loadingMoreCategory: null,
  error: null,
}

// Action types
export type SalonAction =
  | { type: typeof GET_SALONS; payload?: { page?: number; limit?: number } }
  | { type: typeof GET_SALONS_SUCCESS; payload: { data: Salon[]; total: number; page: number; pageSize: number; totalPages: number } }
  | { type: typeof GET_SALONS_ERROR; payload: any }
  | { type: typeof GET_SALON_CATEGORIES; payload?: void }
  | { type: typeof GET_SALON_CATEGORIES_SUCCESS; payload: string[] }
  | { type: typeof GET_SALON_CATEGORIES_ERROR; payload: any }
  | { type: typeof GET_SALON; payload: string }
  | { type: typeof GET_SALON_SUCCESS; payload: Salon }
  | { type: typeof GET_SALON_ERROR; payload: any }
  | { type: typeof GET_SALONS_BY_CATEGORY; payload: { category: string; page?: number; limit?: number; gender?: 'ladies' | 'men' | 'all' | null } }
  | { type: typeof GET_SALONS_BY_CATEGORY_SUCCESS; payload: { category: string; data: Salon[]; page: number; total?: number; totalPages?: number; gender?: 'ladies' | 'men' | 'all' | null } }
  | { type: typeof GET_SALONS_BY_CATEGORY_ERROR; payload: any }
  | { type: typeof GET_SALON_DETAIL; payload: string }
  | { type: typeof GET_SALON_DETAIL_SUCCESS; payload: SalonDetail }
  | { type: typeof GET_SALON_DETAIL_ERROR; payload: string }
