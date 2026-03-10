import { takeEvery } from 'redux-saga/effects'
import * as TYPES from './types'
import { getArtisansSaga } from './getArtisans'
import { getArtisanFiltersSaga } from './getArtisanFilters'

export function* artisanSaga() {
  yield takeEvery(TYPES.GET_ARTISANS, getArtisansSaga)
  yield takeEvery(TYPES.GET_ARTISAN_FILTERS, getArtisanFiltersSaga)
}
