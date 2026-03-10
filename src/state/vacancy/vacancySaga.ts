import { takeEvery } from 'redux-saga/effects'
import * as T from './types'
import { getVacanciesSaga } from './getVacancies'
import { submitVacancyApplicationSaga } from './submitVacancyApplication'

export function* vacancySaga() {
  yield takeEvery(T.GET_VACANCIES, getVacanciesSaga as any)
  yield takeEvery(T.SUBMIT_VACANCY_APPLICATION, submitVacancyApplicationSaga as any)
}
