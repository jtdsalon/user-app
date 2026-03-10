import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getArtisansApi } from '../../services/api/artisanService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import { normalizeArtisan } from '../../services/api/artisanService'

export const getArtisans = (payload?: {
  category?: string
  job_title?: string
  page?: number
  limit?: number
}) => ({
  type: TYPES.GET_ARTISANS,
  payload: payload || {},
})

const getArtisansSuccess = (data: TYPES.Artist[], page: number, total: number, totalPages: number) => ({
  type: TYPES.GET_ARTISANS_SUCCESS,
  payload: { data, page, total, totalPages },
})

const getArtisansError = (payload: any) => ({
  type: TYPES.GET_ARTISANS_ERROR,
  payload,
})

export function* getArtisansSaga(action: {
  payload?: { category?: string; job_title?: string; page?: number; limit?: number }
}): Generator<any, void, any> {
  try {
    const { category, job_title, page = 1, limit = 12 } = action.payload || {}
    const response: any = yield call(getArtisansApi, { category, job_title, page, limit })
    if (response.status === HTTP_CODE.OK || response.status === HTTP_CODE.CREATED) {
      const body = response.data || {}
      const raw = body.data || []
      const list = (Array.isArray(raw) ? raw : []).map((r: any) => normalizeArtisan(r)).filter(Boolean)
      const pag = body.pagination || {}
      const total = pag.total ?? 0
      const totalPages = pag.totalPages ?? pag.pages ?? Math.ceil((total || 1) / limit)
      yield put(getArtisansSuccess(list, page, total, totalPages))
    } else {
      yield put(getArtisansError(response))
    }
  } catch (err) {
    yield put(getArtisansError(err))
  }
}
