import type { Salon, Artist } from '../../components/Home/types'

export const OPEN_BOOKING = 'OPEN_BOOKING'
export const CLOSE_BOOKING = 'CLOSE_BOOKING'
export const LOAD_BOOKING_DATA = 'LOAD_BOOKING_DATA'
export const LOAD_BOOKING_DATA_SUCCESS = 'LOAD_BOOKING_DATA_SUCCESS'
export const LOAD_BOOKING_DATA_ERROR = 'LOAD_BOOKING_DATA_ERROR'
export const LOAD_AVAILABILITY = 'LOAD_AVAILABILITY' // payload: { staffId, date, durationMinutes?, bufferMinutes?, serviceId? }
export const LOAD_AVAILABILITY_SUCCESS = 'LOAD_AVAILABILITY_SUCCESS'
export const LOAD_AVAILABILITY_ERROR = 'LOAD_AVAILABILITY_ERROR'
export const SUBMIT_BOOKING = 'SUBMIT_BOOKING'
export const SUBMIT_BOOKING_SUCCESS = 'SUBMIT_BOOKING_SUCCESS'
export const SUBMIT_BOOKING_ERROR = 'SUBMIT_BOOKING_ERROR'
export const LOAD_LAST_BOOKED = 'LOAD_LAST_BOOKED'
export const LOAD_LAST_BOOKED_SUCCESS = 'LOAD_LAST_BOOKED_SUCCESS'

export interface BookingService {
  id: string
  name: string
  price: number
  original_price?: number
  duration: number
  category?: string
  suggestedImages?: string[]
  promotion_id?: string
}

export interface BookingStaff {
  id: string
  name: string
  image?: string
  role?: string
}

export interface LookbookItem {
  id: string
  image: string
  name?: string
  category?: string
  vibe?: string
}

export interface BookingRules {
  min_notice_minutes?: number
  max_advance_days?: number
  free_cancellation_hours?: number
  late_cancel_fee_type?: string | null
  advance_payment_rule?: string | null
  reschedule_hours?: number
}


export interface TimeSlot {
  time: string
  label: string
}

export interface BookingState {
  salon: Salon | null
  artist: Artist | null
  preselectedServiceId: string | null
  isOpen: boolean
  services: BookingService[]
  staff: BookingStaff[]
  lookbook: LookbookItem[]
  bookingRules: BookingRules | null
  availability: TimeSlot[]
  loading: boolean
  availabilityLoading: boolean
  submitLoading: boolean
  error: string | null
  submitError: string | null
  lastBooked: Salon | null
}

export const INITIAL_BOOKING_STATE: BookingState = {
  salon: null,
  artist: null,
  preselectedServiceId: null,
  isOpen: false,
  services: [],
  staff: [],
  lookbook: [],
  bookingRules: null,
  availability: [],
  loading: false,
  availabilityLoading: false,
  submitLoading: false,
  error: null,
  submitError: null,
  lastBooked: null,
}
