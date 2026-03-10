import * as T from './types'
import type { VacancyState, VacancyAction } from './types'

export const vacancyReducer = (state: VacancyState = T.INITIAL_VACANCY_STATE, action: VacancyAction): VacancyState => {
  switch (action.type) {
    case T.GET_VACANCIES: {
      const page = action.payload?.page ?? 1
      const append = page > 1
      return {
        ...state,
        loading: !append,
        loadMoreLoading: append,
        error: null,
      }
    }
    case T.GET_VACANCIES_SUCCESS: {
      const { data, page, total, totalPages } = action.payload
      const limit = state.pagination.limit
      const jobs = page === 1 ? data : [...state.jobs, ...data]
      return {
        ...state,
        loading: false,
        loadMoreLoading: false,
        jobs,
        pagination: { page, total, totalPages, limit },
        error: null,
      }
    }
    case T.GET_VACANCIES_ERROR:
      return {
        ...state,
        loading: false,
        loadMoreLoading: false,
        error: action.payload,
      }

    case T.SUBMIT_VACANCY_APPLICATION:
      return { ...state, submitLoading: true, submitError: null, submitSuccess: false }
    case T.SUBMIT_VACANCY_APPLICATION_SUCCESS:
      return { ...state, submitLoading: false, submitError: null, submitSuccess: true }
    case T.SUBMIT_VACANCY_APPLICATION_ERROR:
      return { ...state, submitLoading: false, submitError: action.payload, submitSuccess: false }
    case T.CLEAR_SUBMIT_RESULT:
      return { ...state, submitError: null, submitSuccess: false }

    default:
      return state
  }
}
