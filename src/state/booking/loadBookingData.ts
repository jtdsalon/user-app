import { call, put, delay } from 'redux-saga/effects'
import * as T from './types'
import { getBookingContextApi } from '../../services/api/bookingService'

function mapService(s: any): T.BookingService {
  const suggestedImages = Array.isArray(s.suggestedImages) ? s.suggestedImages : []
  return {
    id: String(s.id || s.serviceId || s._id || ''),
    name: s.name || s.serviceName || s.title || '',
    price: Number(s.price || 0),
    original_price: s.original_price != null ? Number(s.original_price) : undefined,
    duration: typeof s.duration === 'number' ? s.duration : Number(s.duration_minutes || s.duration || 0),
    category: s.category || '',
    suggestedImages,
    promotion_id: s.promotion_id || undefined,
  }
}

function mapStaff(st: any): T.BookingStaff {
  const name = st.display_name || st.name || st.fullName || ''
  const image = st.image || st.avatar || st.image_url || st.profile_image || ''
  return {
    id: String(st.id || st.staffId || st._id || name || ''),
    name,
    image,
    role: st.job_title || st.role || st.position || 'Stylist',
  }
}

function mapLookbook(item: any): T.LookbookItem {
  return {
    id: String(item.id || ''),
    image: item.image || '',
    name: item.name,
    category: item.category,
    vibe: item.vibe,
  }
}

export function* loadBookingDataSaga(
  action: { payload: { salon: T.BookingState['salon']; artist: T.BookingState['artist'] } }
): Generator<any, void, any> {
  const { salon, artist } = action.payload
  const salonId = salon?.id || artist?.salonId || null

  if (!salonId) {
    yield put({
      type: T.LOAD_BOOKING_DATA_SUCCESS,
      payload: { services: [], staff: [], lookbook: [] },
    })
    return
  }

  try {
    const res: any = yield call(getBookingContextApi, salonId)
    const data = res?.data?.data ?? res?.data ?? {}

    const services: T.BookingService[] = Array.isArray(data.services)
      ? data.services.map(mapService)
      : []

    const staff: T.BookingStaff[] = Array.isArray(data.staff)
      ? data.staff.map(mapStaff)
      : []

    const lookbook: T.LookbookItem[] = Array.isArray(data.lookbook)
      ? data.lookbook.map(mapLookbook)
      : []

    const bookingRules: T.BookingRules | null = data.bookingRules && typeof data.bookingRules === 'object'
      ? {
          min_notice_minutes: data.bookingRules.min_notice_minutes,
          max_advance_days: data.bookingRules.max_advance_days,
          free_cancellation_hours: data.bookingRules.free_cancellation_hours,
          late_cancel_fee_type: data.bookingRules.late_cancel_fee_type,
          advance_payment_rule: data.bookingRules.advance_payment_rule,
          reschedule_hours: data.bookingRules.reschedule_hours,
        }
      : null

    // Defer state update to next tick so INP stays low (UI can paint before heavy re-render)
    yield delay(0)
    yield put({ type: T.LOAD_BOOKING_DATA_SUCCESS, payload: { services, staff, lookbook, bookingRules } })
  } catch (err: any) {
    const msg = err?.errorMessage || err?.message || 'Failed to load booking data'
    yield put({ type: T.LOAD_BOOKING_DATA_ERROR, payload: msg })
  }
}
