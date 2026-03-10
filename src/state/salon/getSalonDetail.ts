import { call, put, all } from 'redux-saga/effects'
import * as TYPES from './types'
import { getSalonApi, normalizeSalon } from '@/services/api/salonService'
import {
  getSalonServicesApi,
  getStaffBySalonApi,
  getBranchesBySalonApi,
  type SalonServiceRaw,
  type StaffRaw,
  type BranchRaw,
} from '@/services/api/bookingService'
import { getSalonReviewsApi } from '@/services/api/reviewService'
import type { SalonDetail } from './types'
import type { SalonService, SalonReview, Stylist, SalonBranch } from '@/components/Home/types'
import type { ReviewRaw } from '@/services/api/reviewService'

function formatHours(hours: any): string {
  if (!hours) return 'N/A'
  if (typeof hours === 'string') return hours
  if (typeof hours === 'object') {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const val = hours[today] ?? hours[today.slice(0, 3)]
    if (val && val !== 'Closed') return String(val)
    const first = days.find((d) => hours[d] && hours[d] !== 'Closed')
    return first ? String(hours[first]) : 'N/A'
  }
  return 'N/A'
}

function normalizeService(raw: SalonServiceRaw): SalonService {
  return {
    id: String(raw.id),
    name: raw.name || '',
    price: Number(raw.price || 0),
    duration:
      typeof (raw as any).duration_minutes === 'number'
        ? (raw as any).duration_minutes
        : Number((raw as any).duration || 0),
    category: (raw as any).category || 'Service',
    description: (raw as any).description,
  }
}

function normalizeReview(raw: ReviewRaw): SalonReview {
  const firstName = raw.user?.first_name || ''
  const lastName = raw.user?.last_name || ''
  const userName = [firstName, lastName].filter(Boolean).join(' ') || 'Anonymous'
  const created = raw.created_at ? new Date(raw.created_at) : new Date()
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  let dateStr = 'Just now'
  if (diffDays > 0) dateStr = `${diffDays}d ago`
  else if (diffHours > 0) dateStr = `${diffHours}h ago`
  else if (diffMins > 0) dateStr = `${diffMins}m ago`
  const userAvatar =
    (raw as any).user?.avatar ?? (raw as any).avatar ?? (raw as any).user_avatar
      ? String((raw as any).user?.avatar ?? (raw as any).avatar ?? (raw as any).user_avatar)
      : ''
  return {
    id: String(raw.id),
    userName,
    userAvatar,
    rating: Number(raw.rating || 0),
    comment: raw.comment || '',
    date: dateStr,
    reply: (raw as any).salon_reply ?? (raw as any).reply ?? null,
  }
}

function normalizeStylist(raw: StaffRaw): Stylist {
  const name = raw.display_name || raw.name || 'Unknown'
  const image = raw.image || raw.avatar || (raw as any).image_url || (raw as any).profile_image || ''
  return {
    id: String(raw.id),
    name,
    initials: (name.split(' ').map((n) => (n ? n[0] : '')).join('').slice(0, 2) || '--').toUpperCase(),
    image,
    role: raw.job_title || raw.role || 'Stylist',
  }
}

function normalizeBranch(raw: BranchRaw): SalonBranch {
  const hours = raw.hours
  const hoursStr =
    typeof hours === 'object' && hours !== null
      ? formatHours(hours)
      : typeof hours === 'string'
        ? hours
        : 'N/A'
  return {
    id: String(raw.id),
    name: raw.name || '',
    address: raw.address || '',
    city: raw.city || '',
    phone: raw.phone || '',
    hours: hoursStr,
  }
}

export const getSalonDetail = (salonId: string) => ({ type: TYPES.GET_SALON_DETAIL, payload: salonId })
const getSalonDetailSuccess = (payload: SalonDetail) => ({ type: TYPES.GET_SALON_DETAIL_SUCCESS, payload })
const getSalonDetailError = (payload: string) => ({ type: TYPES.GET_SALON_DETAIL_ERROR, payload })

export function* getSalonDetailSaga(action: { payload: string }): Generator<any, void, any> {
  const salonId = action.payload
  if (!salonId) return
  try {
    const fetchServices = () =>
      getSalonServicesApi(salonId).then((r: any) => r?.data?.data ?? r?.data ?? []).catch(() => [])
    const fetchStaff = () =>
      getStaffBySalonApi(salonId).then((r: any) => r?.data?.data ?? r?.data ?? []).catch(() => [])
    const fetchReviews = () =>
      getSalonReviewsApi(salonId, 1, 50).then((r: any) => r?.data?.data ?? r?.data ?? []).catch(() => [])
    const fetchBranches = () =>
      getBranchesBySalonApi(salonId).then((r: any) => r?.data?.data ?? r?.data ?? []).catch(() => [])

    const [salonRes, servicesArr, staffArr, reviewsArr, branchesArr]: any[] = yield all([
      call(getSalonApi, salonId),
      call(fetchServices),
      call(fetchStaff),
      call(fetchReviews),
      call(fetchBranches),
    ])

    const baseRaw = salonRes?.data?.data ?? salonRes?.data
    const baseSalon = baseRaw ? normalizeSalon(baseRaw) : null

    const services: SalonService[] = Array.isArray(servicesArr) ? servicesArr.map((s: SalonServiceRaw) => normalizeService(s)) : []
    const stylists: Stylist[] = Array.isArray(staffArr) ? staffArr.map((s: StaffRaw) => normalizeStylist(s)) : []
    const reviewsList: SalonReview[] = Array.isArray(reviewsArr) ? reviewsArr.map((r: ReviewRaw) => normalizeReview(r)) : []
    const branches: SalonBranch[] = Array.isArray(branchesArr) ? branchesArr.map((b: BranchRaw) => normalizeBranch(b)) : []

    const merged: SalonDetail = {
      ...(baseSalon || {
        id: salonId,
        name: '',
        location: '',
        rating: 0,
        image: '',
        coverImage: '',
        category: 'General',
        description: '',
        nextAvailable: 'TBD',
        priceRange: '',
        status: 'online',
        clients: 0,
        fullServices: [],
        isVerified: false,
        hours: 'N/A',
        servicesCount: 0,
        stylists: [],
        offers: [],
        reviews: [],
        branches: [],
      }),
      fullServices: services,
      stylists,
      branches,
      reviews: reviewsList,
      servicesCount: services.length,
      rating:
        reviewsList.length > 0
          ? Number((reviewsList.reduce((a, r) => a + r.rating, 0) / reviewsList.length).toFixed(1))
          : baseSalon?.rating ?? 0,
    } as SalonDetail

    yield put(getSalonDetailSuccess(merged))
  } catch (err: any) {
    yield put(getSalonDetailError(err?.message || 'Failed to load salon'))
  }
}
