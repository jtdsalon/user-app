import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { getStaffAvailabilityApi } from '../../services/api/bookingService'

export function* loadAvailabilitySaga(
  action: { payload: { staffId: string; date: string; durationMinutes?: number; bufferMinutes?: number; serviceId?: string } }
): Generator<any, void, any> {
  const { staffId, date, durationMinutes, bufferMinutes, serviceId } = action.payload

  if (!staffId || !date) return

  try {
    const options =
      durationMinutes != null || bufferMinutes != null || serviceId
        ? { durationMinutes, bufferMinutes, serviceId }
        : undefined
    const res: any = yield call(getStaffAvailabilityApi, staffId, date, options)
    const raw = res?.data
    const slots: T.TimeSlot[] = raw?.data?.slots ?? raw?.slots ?? (Array.isArray(raw) ? raw : [])
    yield put({ type: T.LOAD_AVAILABILITY_SUCCESS, payload: slots })
  } catch (err: any) {
    const msg = err?.errorMessage || err?.message || 'Failed to load availability'
    yield put({ type: T.LOAD_AVAILABILITY_ERROR, payload: msg })
  }
}
