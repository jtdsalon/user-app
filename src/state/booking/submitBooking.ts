import { call, put, select } from 'redux-saga/effects'
import * as T from './types'
import type { RootState } from '../store'
import {
  createBookingApi,
  uploadStyleImageApi,
  type CreateBookingPayload,
} from '../../services/api/bookingService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import { clearUserStorage } from '../../lib/logout'
import store from '../store'
import { resetStore } from '../actions'

function isDataUrl(str: string): boolean {
  return typeof str === 'string' && str.startsWith('data:')
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const res = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!res) return null
    const mime = res[1]
    const b64 = res[2]
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: mime })
  } catch {
    return null
  }
}

export interface SubmitBookingActionPayload {
  salonId: string
  serviceIds: string[]
  services: Array<{ id: string; price: number; duration: number; original_price?: number; promotion_id?: string }>
  staffId?: string
  bookingDate: string
  startTime: string
  endTime: string
  notes?: string
  styleImages: Record<string, string> // serviceId -> url or dataUrl
}

export function* submitBookingSaga(
  action: { payload: SubmitBookingActionPayload }
): Generator<any, void, any> {
  const payload = action.payload

  try {
    const styleImageUrls: string[] = []
    const entries = Object.entries(payload.styleImages || {})

    for (const [, img] of entries) {
      if (!img) continue
      if (img.startsWith('http://') || img.startsWith('https://')) {
        styleImageUrls.push(img)
      } else if (isDataUrl(img)) {
        const blob = dataUrlToBlob(img)
        if (blob) {
          const file = new File([blob], 'style.png', { type: blob.type })
          const uploadRes: any = yield call(uploadStyleImageApi, file)
          const url = uploadRes?.data?.url || uploadRes?.data?.data?.url
          if (url) styleImageUrls.push(url)
        }
      }
    }

    const createPayload: CreateBookingPayload = {
      salon_id: payload.salonId,
      service_ids: payload.serviceIds,
      services: payload.services.map((s) => ({
        id: s.id,
        price: s.price,
        duration_minutes: s.duration,
        ...(s.original_price != null && { original_price: s.original_price }),
        ...(s.promotion_id && { promotion_id: s.promotion_id }),
      })),
      staff_id: payload.staffId || undefined,
      booking_date: payload.bookingDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      notes: payload.notes,
      style_image_urls: styleImageUrls.length ? styleImageUrls : undefined,
    }

    const res: any = yield call(createBookingApi, createPayload)

    if (res?.status === HTTP_CODE.OK || res?.status === HTTP_CODE.CREATED) {
      const bookingState = yield select((s: RootState) => (s as any).booking)
      let salon = bookingState?.salon
      if (!salon && (bookingState?.artist || payload.salonId)) {
        const a = bookingState?.artist
        salon = {
          id: payload.salonId,
          name: a?.salonName || 'Your sanctuary',
          image: a?.avatar || a?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
          coverImage: a?.image,
        } as any
      }
      yield put({ type: T.SUBMIT_BOOKING_SUCCESS })
      if (salon) {
        yield put({ type: T.LOAD_LAST_BOOKED_SUCCESS, payload: salon })
        try {
          const existing: Array<{ salonId: string; salonName?: string; salonImage?: string; timestamp: number }> =
            JSON.parse(localStorage.getItem('luxe_bookings') || '[]')
          const entry = {
            salonId: salon.id,
            salonName: salon.name,
            salonImage: salon.image || salon.coverImage,
            timestamp: Date.now(),
          }
          localStorage.setItem('luxe_bookings', JSON.stringify([entry, ...existing]))
        } catch (_) {}
      }
      // Sync favorites so UI shows salon as followed after booking (backend may return followedSalonId when it auto-followed)
      const followedSalonId = res?.data?.data?.followedSalonId ?? (salon?.id ? String(salon.id) : null)
      if (followedSalonId) {
        try {
          const favs: string[] = JSON.parse(localStorage.getItem('luxe_favs') || '[]')
          if (!favs.includes(followedSalonId)) {
            const next = [...favs, followedSalonId]
            localStorage.setItem('luxe_favs', JSON.stringify(next))
            window.dispatchEvent(new CustomEvent('booking:salon-followed', { detail: { salonId: followedSalonId } }))
          }
        } catch (_) {}
      }
    } else {
      yield put({
        type: T.SUBMIT_BOOKING_ERROR,
        payload: res?.data?.message || 'Booking failed',
      })
    }
  } catch (err: any) {
    const code = err?.externalErrorMessage || err?.response?.data?.code
    const status = err?.statusCode ?? err?.response?.status

    // User not in DB (e.g. token from another env or DB reset) → treat as session expired
    if (status === HTTP_CODE.NOT_FOUND && code === 'USER_NOT_FOUND') {
      clearUserStorage()
      store.dispatch(resetStore())
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
      yield put({
        type: T.SUBMIT_BOOKING_ERROR,
        payload: err?.errorMessage || 'Your session is invalid. Please sign in again.',
      })
      return
    }

    const msg = err?.errorMessage || err?.message || 'Failed to create booking'
    yield put({ type: T.SUBMIT_BOOKING_ERROR, payload: msg })
  }
}
