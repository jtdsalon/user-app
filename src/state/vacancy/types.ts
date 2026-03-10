import type { JobListing } from '../../components/Jobs/constants'

export const GET_VACANCIES = 'GET_VACANCIES'
export const GET_VACANCIES_SUCCESS = 'GET_VACANCIES_SUCCESS'
export const GET_VACANCIES_ERROR = 'GET_VACANCIES_ERROR'

export const SUBMIT_VACANCY_APPLICATION = 'SUBMIT_VACANCY_APPLICATION'
export const SUBMIT_VACANCY_APPLICATION_SUCCESS = 'SUBMIT_VACANCY_APPLICATION_SUCCESS'
export const SUBMIT_VACANCY_APPLICATION_ERROR = 'SUBMIT_VACANCY_APPLICATION_ERROR'
export const CLEAR_SUBMIT_RESULT = 'CLEAR_SUBMIT_RESULT'

export interface VacancyPagination {
  page: number
  total: number
  totalPages: number
  limit: number
}

export interface VacancyState {
  jobs: JobListing[]
  loading: boolean
  loadMoreLoading: boolean
  pagination: VacancyPagination
  error: any
  submitLoading: boolean
  submitError: string | null
  submitSuccess: boolean
}

export const INITIAL_VACANCY_STATE: VacancyState = {
  jobs: [],
  loading: false,
  loadMoreLoading: false,
  pagination: { page: 1, total: 0, totalPages: 0, limit: 12 },
  error: null,
  submitLoading: false,
  submitError: null,
  submitSuccess: false,
}

export type VacancyAction =
  | { type: typeof GET_VACANCIES; payload: { page?: number; search?: string } }
  | { type: typeof GET_VACANCIES_SUCCESS; payload: { data: JobListing[]; page: number; total: number; totalPages: number } }
  | { type: typeof GET_VACANCIES_ERROR; payload: any }
  | { type: typeof SUBMIT_VACANCY_APPLICATION; payload: { vacancyId: string; name: string; email: string; portfolio: string; resume?: string; message?: string } }
  | { type: typeof SUBMIT_VACANCY_APPLICATION_SUCCESS }
  | { type: typeof SUBMIT_VACANCY_APPLICATION_ERROR; payload: string }
  | { type: typeof CLEAR_SUBMIT_RESULT }
