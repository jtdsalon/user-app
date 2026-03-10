import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { getMyBookingsApi } from '../../services/api/bookingService'
import type { Salon } from '../../components/Home/types'
const DEFAULT_SALON_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'

function salonFromApiBooking(first: {
  salon?: { id: string; name: string; image_url?: string | null; cover_image_url?: string | null; avatar?: string | null }
}): Salon | null {
  const s = first?.salon
  if (!s) return null
  const image = s.image_url || s.avatar || s.cover_image_url || DEFAULT_SALON_IMAGE
  return {
    id: s.id,
    name: s.name,
    image,
    coverImage: s.cover_image_url || s.image_url || s.avatar || DEFAULT_SALON_IMAGE,
    location: '',
    rating: 0,
    category: '',
    description: '',
    nextAvailable: '',
    priceRange: '',
    status: 'online',
    clients: 0,
    fullServices: [],
    isVerified: false,
    hours: '',
    servicesCount: 0,
    stylists: [],
    offers: [],
    reviews: [],
    branches: [],
  } as Salon
}

function salonFromLocalStorage(): Salon | null {
  try {
    const bookingsStr = localStorage.getItem('luxe_bookings')
    if (!bookingsStr) return null
    const parsed: Array<{ salonId: string; salonName?: string; salonImage?: string; timestamp: number }> =
      JSON.parse(bookingsStr)
    if (!parsed.length) return null
    const sorted = [...parsed].sort((a, b) => b.timestamp - a.timestamp)
    const lastAppt = sorted[0]
    return {
      id: lastAppt.salonId,
      name: lastAppt.salonName || 'Your last sanctuary',
      image: lastAppt.salonImage || DEFAULT_SALON_IMAGE,
      coverImage: lastAppt.salonImage || DEFAULT_SALON_IMAGE,
      location: '',
      rating: 0,
      category: '',
      description: '',
      nextAvailable: '',
      priceRange: '',
      status: 'online',
      clients: 0,
      fullServices: [],
      isVerified: false,
      hours: '',
      servicesCount: 0,
      stylists: [],
      offers: [],
      reviews: [],
      branches: [],
    } as Salon
  } catch {
    return null
  }
}

export function* loadLastBookedSaga(): Generator<any, void, any> {
  try {
    const res: any = yield call(getMyBookingsApi, { page: 1, limit: 1 })
    const body = res?.data as { data?: Array<{ salon?: { id: string; name: string; image_url?: string | null; cover_image_url?: string | null } }> }
    const bookings = Array.isArray(body?.data) ? body.data : []
    const first = bookings[0]
    const salon = salonFromApiBooking(first)
    yield put({ type: T.LOAD_LAST_BOOKED_SUCCESS, payload: salon })
  } catch {
    const salon = salonFromLocalStorage()
    yield put({ type: T.LOAD_LAST_BOOKED_SUCCESS, payload: salon })
  }
}
