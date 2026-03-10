import { takeEvery } from 'redux-saga/effects'
import * as T from './types'
import { loadBookingDataSaga } from './loadBookingData'
import { loadAvailabilitySaga } from './loadAvailability'
import { loadLastBookedSaga } from './loadLastBooked'
import { submitBookingSaga } from './submitBooking'

export function* bookingSaga() {
  yield takeEvery(T.LOAD_BOOKING_DATA, loadBookingDataSaga as any)
  yield takeEvery(T.LOAD_AVAILABILITY, loadAvailabilitySaga as any)
  yield takeEvery(T.LOAD_LAST_BOOKED, loadLastBookedSaga as any)
  yield takeEvery(T.SUBMIT_BOOKING, submitBookingSaga as any)
}
