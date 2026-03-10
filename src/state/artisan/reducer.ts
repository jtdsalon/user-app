import * as TYPES from './types'
import type { ArtisanState, ArtisanAction } from './types'

export const artisanReducer = (state: ArtisanState = TYPES.INITIAL_STATE, action: ArtisanAction): ArtisanState => {
  switch (action.type) {
    case TYPES.GET_ARTISANS: {
      const page = (action.payload as any)?.page ?? 1
      return {
        ...state,
        loading: page === 1,
        loadingMore: page > 1,
        error: null,
      }
    }
    case TYPES.GET_ARTISANS_SUCCESS: {
      const { data, page } = action.payload
      const artisans = page === 1 ? data : [...state.artisans, ...data]
      return {
        ...state,
        loading: false,
        loadingMore: false,
        artisans,
        pagination: {
          page: action.payload.page,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
        error: null,
      }
    }
    case TYPES.GET_ARTISANS_ERROR:
      return { ...state, loading: false, loadingMore: false, error: action.payload }

    case TYPES.GET_ARTISAN_FILTERS:
      return { ...state, filtersLoading: true, error: null }
    case TYPES.GET_ARTISAN_FILTERS_SUCCESS:
      return {
        ...state,
        filtersLoading: false,
        artisanFilters: { jobTitles: action.payload.jobTitles || [] },
        error: null,
      }
    case TYPES.GET_ARTISAN_FILTERS_ERROR:
      return { ...state, filtersLoading: false, error: action.payload }

    default:
      return state
  }
}
