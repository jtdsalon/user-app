import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getSalonsApi } from '../../services/api/salonService'
import { HTTP_CODE } from '../../lib/enums/httpData'

// Action creators
export const getSalons = (payload?: { page?: number; limit?: number }) => ({
  type: TYPES.GET_SALONS,
  payload,
})

const getSalonsSuccess = (payload: any) => ({ type: TYPES.GET_SALONS_SUCCESS, payload })
const getSalonsError = (payload: any) => ({ type: TYPES.GET_SALONS_ERROR, payload })

// Saga
export function* getSalonsSaga(action: { payload?: { page?: number; limit?: number } }): Generator<any, void, any> {
  try {
    const page = action.payload?.page || 1
    const limit = action.payload?.limit || 10
    const response: any = yield call(getSalonsApi, page, limit)
    if (response.status === HTTP_CODE.OK || response.status === HTTP_CODE.CREATED) {
      // Expect API to return either:
      // { data: [...], pagination: { page, limit, total, pages } }
      // or { salons: [...], total }
      const data = response.data || {}

      const list = data.data || data.salons || []

      const total = data.total || (data.pagination ? data.pagination.total : 0)
      const respPage = data.page || (data.pagination ? data.pagination.page : page) || page
      const pageSize = data.pageSize || (data.pagination ? data.pagination.limit : limit) || limit
      const totalPages = data.totalPages || (data.pagination ? data.pagination.pages : Math.ceil((total || 0) / (pageSize || limit)))

      const payload = {
        data: list,
        total,
        page: respPage,
        pageSize,
        totalPages,
      }
      yield put(getSalonsSuccess(payload))
    } else {
      yield put(getSalonsError(response))
    }
  } catch (err) {
    yield put(getSalonsError(err))
  }
}
