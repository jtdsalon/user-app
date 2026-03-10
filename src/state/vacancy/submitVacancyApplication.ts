import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { submitVacancyApplicationApi } from '../../services/api/vacancyService'
import { HTTP_CODE } from '../../lib/enums/httpData'

export const submitVacancyApplication = (payload: {
  vacancyId: string
  name: string
  email: string
  portfolio: string
  resume?: string
  message?: string
}) => ({
  type: T.SUBMIT_VACANCY_APPLICATION,
  payload,
})

export const clearSubmitResult = () => ({ type: T.CLEAR_SUBMIT_RESULT })

export function* submitVacancyApplicationSaga(
  action: { payload: { vacancyId: string; name: string; email: string; portfolio: string; resume?: string; message?: string } }
): Generator<any, void, any> {
  const { vacancyId, name, email, portfolio, resume, message } = action.payload
  try {
    const res: any = yield call(submitVacancyApplicationApi, vacancyId, {
      name,
      email,
      portfolio,
      resume,
      message,
    })
    if (res?.status === HTTP_CODE.OK || res?.status === HTTP_CODE.CREATED) {
      yield put({ type: T.SUBMIT_VACANCY_APPLICATION_SUCCESS })
    } else {
      const msg = res?.data?.message || 'Failed to submit application'
      yield put({ type: T.SUBMIT_VACANCY_APPLICATION_ERROR, payload: msg })
    }
  } catch (err: any) {
    const details = err?.response?.data?.errors
    const msg = details?.length
      ? details.map((d: any) => d.message).join('. ')
      : err?.errorMessage || err?.response?.data?.message || err?.message || 'Failed to submit application'
    yield put({ type: T.SUBMIT_VACANCY_APPLICATION_ERROR, payload: msg })
  }
}
