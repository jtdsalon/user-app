import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getSalonsByCategoryApi } from '../../services/api/salonService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import { normalizeSalonList } from '../../services/api/salonService'

export const getSalonsByCategory = (payload: {
  category: string
  page?: number
  limit?: number
  gender?: 'ladies' | 'men' | 'all' | null
}) => ({
  type: TYPES.GET_SALONS_BY_CATEGORY,
  payload,
})

const getSalonsByCategorySuccess = (
  category: string,
  data: TYPES.Salon[],
  page: number,
  total?: number,
  totalPages?: number,
  gender?: 'ladies' | 'men' | 'all' | null
) => ({
  type: TYPES.GET_SALONS_BY_CATEGORY_SUCCESS,
  payload: { category, data, page, total, totalPages, gender },
})

const getSalonsByCategoryError = (payload: any) => ({
  type: TYPES.GET_SALONS_BY_CATEGORY_ERROR,
  payload,
})

export function* getSalonsByCategorySaga(action: {
  payload: { category: string; page?: number; limit?: number; gender?: 'ladies' | 'men' | 'all' | null }
}): Generator<any, void, any> {
  try {
    const { category, page = 1, limit = 10, gender } = action.payload
    const response: any = yield call(getSalonsByCategoryApi, category, page, limit, gender ?? undefined)
    if (response.status === HTTP_CODE.OK || response.status === HTTP_CODE.CREATED) {
      const data = response.data || {}
      const raw = data.data || data.salons || []
      const list = normalizeSalonList(raw).filter(Boolean) as TYPES.Salon[]
      const total = data.total ?? data.pagination?.total ?? 0
      const totalPages = data.totalPages ?? data.pagination?.pages ?? Math.ceil((total || 1) / limit)
      yield put(getSalonsByCategorySuccess(category, list, page, total, totalPages, gender ?? undefined))
    } else {
      yield put(getSalonsByCategoryError(response))
    }
  } catch (err) {
    yield put(getSalonsByCategoryError(err))
  }
}
