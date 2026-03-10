import { AxiosResponse } from 'axios'
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import { GET_SALON_REVIEWS_URL } from './endPoints'

export const CREATE_REVIEW_URL = '/reviews'

export interface ReviewRaw {
  id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  salon_reply?: string | null
  user?: { first_name?: string; last_name?: string; avatar?: string | null }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination?: { page: number; limit: number; total: number; pages: number }
}

export function getSalonReviewsApi(
  salonId: string,
  page = 1,
  limit = 20
): Promise<AxiosResponse<PaginatedResponse<ReviewRaw>>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SALON_REVIEWS_URL.replace('{salonId}', salonId),
    params: { page, limit },
  })
}

export interface CreateReviewPayload {
  salon_id: string
  rating: number
  comment: string
  title?: string
  service_id?: string
}

export function createReviewApi(payload: CreateReviewPayload): Promise<AxiosResponse<any>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: CREATE_REVIEW_URL,
    data: {
      salon_id: payload.salon_id,
      rating: payload.rating,
      comment: payload.comment,
      title: payload.title || 'Reflection',
      ...(payload.service_id && { service_id: payload.service_id }),
    },
  })
}
