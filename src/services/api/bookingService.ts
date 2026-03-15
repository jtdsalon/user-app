import { AxiosResponse } from 'axios'
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import {
  VALIDATE_PROMO_CODE_URL,
  RECORD_PROMOTION_VIEW_URL,
  GET_BOOKING_CONTEXT_URL,
  GET_MY_BOOKINGS_URL,
  GET_SALON_SERVICES_URL,
  GET_STAFF_BY_SALON_URL,
  GET_STAFF_AVAILABILITY_URL,
  CREATE_BOOKING_URL,
  CREATE_SLOT_HOLD_URL,
  RELEASE_SLOT_HOLD_URL,
  CANCEL_BOOKING_URL,
  RESCHEDULE_BOOKING_URL,
  UPLOAD_STYLE_IMAGE_URL,
  GET_BRANCHES_BY_SALON_URL,
} from './endPoints'

/** Aggregated "Booking Init" API - returns salon, services, staff in one call */
export interface BookingContextResponse {
  salon?: Record<string, unknown>
  services: SalonServiceRaw[]
  staff: StaffRaw[]
  lookbook?: Array<{ id: string; image: string; name?: string; category?: string; vibe?: string }>
}

export interface ValidatedPromo {
  id: string
  title: string
  code: string
  discount_type?: string | null
  discount_value?: number | null
  discount_percent?: number | null
  bundle_price?: number | null
  promotion_type?: string
}

export function validatePromoCodeApi(
  salonId: string,
  code: string,
  options?: {
    serviceIds?: string[]
    bookingDate?: string
    startTime?: string
    bookingTotal?: number
    serviceCategories?: string[]
  }
): Promise<AxiosResponse<ValidatedPromo>> {
  const params: Record<string, string | undefined> = { salonId, code }
  if (options?.serviceIds?.length) params.serviceIds = options.serviceIds.join(',')
  if (options?.bookingDate) params.bookingDate = options.bookingDate
  if (options?.startTime) params.startTime = options.startTime
  if (options?.bookingTotal != null) params.bookingTotal = String(options.bookingTotal)
  if (options?.serviceCategories?.length) params.serviceCategories = options.serviceCategories.join(',')
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: VALIDATE_PROMO_CODE_URL,
    params,
  })
}

/** Record a promotion view/click for salon analytics (fire-and-forget). */
export function recordPromotionViewApi(promotionId: string): Promise<AxiosResponse<{ recorded?: boolean }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: RECORD_PROMOTION_VIEW_URL.replace('{id}', promotionId),
  })
}

export function getBookingContextApi(salonId: string): Promise<AxiosResponse<BookingContextResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_BOOKING_CONTEXT_URL,
    params: { salonId },
  })
}

export interface MyBookingItem {
  id: string
  salon_id: string
  staff_id?: string | null
  service_id: string | null
  booking_date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  service?: { name: string; price: number; duration_minutes?: number }
  salon?: {
    id: string
    name: string
    image_url: string | null
    cover_image_url: string | null
  }
  staff?: { display_name?: string | null } | null
}

export interface MyBookingsResponse {
  data: MyBookingItem[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

export function getMyBookingsApi(params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<AxiosResponse<MyBookingsResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_MY_BOOKINGS_URL,
    params: { page: 1, limit: 1, ...params },
  })
}

export interface SalonServiceRaw {
  id: string
  name: string
  price: number | string
  duration_minutes?: number
  duration?: number
  category?: string
  suggestedImages?: string[]
}

export interface StaffRaw {
  id: string
  display_name?: string
  name?: string
  job_title?: string
  role?: string
  image?: string
  avatar?: string
}

export interface TimeSlot {
  time: string
  label: string
}

export function getSalonServicesApi(salonId: string): Promise<AxiosResponse<SalonServiceRaw[]>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SALON_SERVICES_URL.replace('{salonId}', salonId),
  })
}

export function getStaffBySalonApi(salonId: string): Promise<AxiosResponse<StaffRaw[]>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_STAFF_BY_SALON_URL.replace('{salonId}', salonId),
  })
}

export interface BranchRaw {
  id: string
  name: string
  address?: string
  city?: string
  phone?: string
  hours?: Record<string, string> | any
}

export function getBranchesBySalonApi(salonId: string): Promise<AxiosResponse<BranchRaw[]>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_BRANCHES_BY_SALON_URL.replace('{salonId}', salonId),
  })
}

export function getStaffAvailabilityApi(
  staffId: string,
  date: string,
  options?: { durationMinutes?: number; bufferMinutes?: number; serviceId?: string }
): Promise<AxiosResponse<{ slots: TimeSlot[] }>> {
  const params: Record<string, string | number> = { date }
  if (options?.durationMinutes != null && options.durationMinutes > 0) params.durationMinutes = options.durationMinutes
  if (options?.bufferMinutes != null && options.bufferMinutes >= 0) params.bufferMinutes = options.bufferMinutes
  if (options?.serviceId) params.serviceId = options.serviceId
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_STAFF_AVAILABILITY_URL.replace('{staffId}', staffId),
    params,
  })
}

export interface CreateBookingPayload {
  salon_id: string
  service_ids?: string[]
  services?: Array<{ id: string; price: number | string; duration_minutes?: number; original_price?: number; promotion_id?: string }>
  staff_id?: string
  booking_date: string
  start_time: string
  end_time: string
  notes?: string
  style_image_urls?: string[]
  slot_hold_id?: string
}

/** §12: Create a 10-min slot hold to prevent double booking (staff_id required). */
export interface CreateSlotHoldPayload {
  salon_id: string
  staff_id: string
  booking_date: string
  start_time: string
  end_time: string
}

export function createSlotHoldApi(payload: CreateSlotHoldPayload): Promise<AxiosResponse<{ id: string; expires_at: string }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: CREATE_SLOT_HOLD_URL,
    data: payload,
  })
}

export function releaseSlotHoldApi(holdId: string): Promise<AxiosResponse<{ released: boolean }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: RELEASE_SLOT_HOLD_URL.replace('{holdId}', holdId),
  })
}

/** Cancel a booking (customer). Requires reason. Returns { data: { late_cancel_fee?: number } } when applicable. */
export function cancelBookingApi(bookingId: string, reason: string): Promise<AxiosResponse<{ data?: { late_cancel_fee?: number }; late_cancel_fee?: number }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: CANCEL_BOOKING_URL.replace('{bookingId}', bookingId),
    data: { reason },
  })
}

export interface RescheduleBookingPayload {
  booking_date: string
  start_time: string
  end_time: string
}

export function rescheduleBookingApi(bookingId: string, payload: RescheduleBookingPayload): Promise<AxiosResponse<any>> {
  return networkClient().request({
    method: HTTP_METHOD.PATCH,
    url: RESCHEDULE_BOOKING_URL.replace('{bookingId}', bookingId),
    data: payload,
  })
}

export function createBookingApi(payload: CreateBookingPayload): Promise<AxiosResponse<any>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: CREATE_BOOKING_URL,
    data: payload,
  })
}

export function uploadStyleImageApi(file: File): Promise<AxiosResponse<{ url: string }>> {
  const formData = new FormData()
  formData.append('image', file)
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: UPLOAD_STYLE_IMAGE_URL,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
