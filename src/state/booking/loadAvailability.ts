import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { getStaffAvailabilityApi } from '../../services/api/bookingService'

export function* loadAvailabilitySaga(
  action: { payload: { staffId: string; date: string } }
): Generator<any, void, any> {
  const { staffId, date } = action.payload

  if (!staffId || !date) return

  try {
    const res: any = yield call(getStaffAvailabilityApi, staffId, date)
    const slots: T.TimeSlot[] = res?.data?.slots ?? res?.data ?? []
    yield put({ type: T.LOAD_AVAILABILITY_SUCCESS, payload: slots })
  } catch (err: any) {
    const msg = err?.errorMessage || err?.message || 'Failed to load availability'
    yield put({ type: T.LOAD_AVAILABILITY_ERROR, payload: msg })
  }
}
