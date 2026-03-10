import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getArtisanFiltersApi } from '../../services/api/artisanService'
import { HTTP_CODE } from '../../lib/enums/httpData'

export const getArtisanFilters = () => ({
  type: TYPES.GET_ARTISAN_FILTERS,
})

const getArtisanFiltersSuccess = (jobTitles: string[]) => ({
  type: TYPES.GET_ARTISAN_FILTERS_SUCCESS,
  payload: { jobTitles },
})

const getArtisanFiltersError = (payload: any) => ({
  type: TYPES.GET_ARTISAN_FILTERS_ERROR,
  payload,
})

export function* getArtisanFiltersSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(getArtisanFiltersApi)
    if (response.status === HTTP_CODE.OK || response.status === HTTP_CODE.CREATED) {
      const body = response.data || {}
      const jobTitles = body.jobTitles || body.data?.jobTitles || []
      yield put(getArtisanFiltersSuccess(Array.isArray(jobTitles) ? jobTitles : []))
    } else {
      yield put(getArtisanFiltersError(response))
    }
  } catch (err) {
    yield put(getArtisanFiltersError(err))
  }
}
