import * as TYPES from './types'
import type { SalonState, SalonAction, SalonDetail } from './types'

export const salonReducer = (state: SalonState = TYPES.INITIAL_STATE, action: SalonAction): SalonState => {
  switch (action.type) {
    case TYPES.GET_SALONS:
      return { ...state, loading: true, error: null }
    case TYPES.GET_SALONS_SUCCESS:
      return {
        ...state,
        loading: false,
        salons: action.payload.data,
        pagination: {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        },
        error: null,
      }
    case TYPES.GET_SALONS_ERROR:
      return { ...state, loading: false, error: action.payload }

    case TYPES.GET_SALON_CATEGORIES:
      return { ...state, categoriesLoading: true, error: null }
    case TYPES.GET_SALON_CATEGORIES_SUCCESS:
      return { ...state, categoriesLoading: false, categories: action.payload, error: null }
    case TYPES.GET_SALON_CATEGORIES_ERROR:
      return { ...state, categoriesLoading: false, error: action.payload }

    case TYPES.GET_SALON:
      return { ...state, loading: true, error: null }
    case TYPES.GET_SALON_SUCCESS:
      return { ...state, loading: false, salon: action.payload, error: null }
    case TYPES.GET_SALON_ERROR:
      return { ...state, loading: false, error: action.payload }

    case TYPES.GET_SALON_DETAIL:
      return { ...state, salonDetailLoading: true, salonDetailError: null }
    case TYPES.GET_SALON_DETAIL_SUCCESS:
      return {
        ...state,
        salonDetailLoading: false,
        salonDetail: action.payload as SalonDetail,
        salonDetailError: null,
      }
    case TYPES.GET_SALON_DETAIL_ERROR:
      return {
        ...state,
        salonDetailLoading: false,
        salonDetail: null,
        salonDetailError: action.payload,
      }

    case TYPES.GET_SALONS_BY_CATEGORY: {
      const page = action.payload?.page || 1
      const category = action.payload?.category || ''
      return {
        ...state,
        salonsByCategoryLoading: page === 1,
        loadingMoreCategory: page > 1 ? category : null,
        error: null,
      }
    }
    case TYPES.GET_SALONS_BY_CATEGORY_SUCCESS: {
      const { category, data, page = 1, total = 0, totalPages = 0, gender } = action.payload
      const mapKey = gender ? `${category}:${gender}` : category
      const existing = state.salonsByCategoryMap[mapKey] || []
      const merged = page === 1 ? data : [...existing, ...data]
      const salonsByCategoryMap = { ...state.salonsByCategoryMap, [mapKey]: merged }
      const categoryPagination = {
        ...state.categoryPagination,
        [mapKey]: { page, total, totalPages },
      }
      return {
        ...state,
        salonsByCategoryLoading: false,
        loadingMoreCategory: null,
        salonsByCategory: merged,
        salonsByCategoryMap,
        categoryPagination,
        error: null,
      }
    }
    case TYPES.GET_SALONS_BY_CATEGORY_ERROR:
      return { ...state, salonsByCategoryLoading: false, loadingMoreCategory: null, error: action.payload }

    default:
      return state
  }
}
