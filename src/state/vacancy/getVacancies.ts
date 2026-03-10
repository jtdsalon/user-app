import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { getVacanciesApi, mapVacancyToJobListing } from '../../services/api/vacancyService'
import { HTTP_CODE } from '../../lib/enums/httpData'

export const getVacancies = (payload?: { page?: number; search?: string }) => ({
  type: T.GET_VACANCIES,
  payload: payload ?? {},
})

const getVacanciesSuccess = (data: import('../../components/Jobs/constants').JobListing[], page: number, total: number, totalPages: number) => ({
  type: T.GET_VACANCIES_SUCCESS,
  payload: { data, page, total, totalPages },
})

const getVacanciesError = (payload: any) => ({
  type: T.GET_VACANCIES_ERROR,
  payload,
})

export function* getVacanciesSaga(action: { payload: { page?: number; search?: string } }): Generator<any, void, any> {
  const { page = 1, search } = action.payload
  const limit = 12
  const append = page > 1

  try {
    const response: any = yield call(getVacanciesApi, page, limit, search || undefined, 'Open')
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const payload = response?.data ?? {}
      const dataArr = payload.data ?? []
      const pagination = (payload.pagination ?? {}) as { total?: number; totalPages?: number }
      const mapped = (Array.isArray(dataArr) ? dataArr : []).map(mapVacancyToJobListing)
      const total = pagination?.total ?? mapped.length
      const totalPages = pagination?.totalPages ?? 0
      yield put(getVacanciesSuccess(mapped, page, total, totalPages))
    } else {
      yield put(getVacanciesError(response))
    }
  } catch (err) {
    yield put(getVacanciesError(err))
  }
}
