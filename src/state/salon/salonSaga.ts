import { takeEvery, takeLeading } from 'redux-saga/effects'
import * as TYPES from './types'
import { getSalonsSaga } from './getSalons'
import { getSalonSaga } from './getSalon'
import { getSalonCategoriesSaga } from './getSalonCategories'
import { getSalonsByCategorySaga } from './getSalonsByCategory'
import { getSalonDetailSaga } from './getSalonDetail'

export function* salonSaga() {
  yield takeEvery(TYPES.GET_SALONS, getSalonsSaga)
  yield takeEvery(TYPES.GET_SALON, getSalonSaga)
  yield takeEvery(TYPES.GET_SALON_CATEGORIES, getSalonCategoriesSaga)
  yield takeEvery(TYPES.GET_SALONS_BY_CATEGORY, getSalonsByCategorySaga)
  // takeLeading: only one salon-detail fetch at a time; avoids duplicate calls from Strict Mode or rapid re-renders
  yield takeLeading(TYPES.GET_SALON_DETAIL, getSalonDetailSaga)
}
