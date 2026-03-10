import { AxiosResponse } from 'axios'
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import {
  GET_NOTIFICATIONS_URL,
  GET_NOTIFICATIONS_UNREAD_COUNT_URL,
  MARK_NOTIFICATION_READ_URL,
  MARK_ALL_NOTIFICATIONS_READ_URL,
  DELETE_NOTIFICATION_URL,
  CLEAR_ALL_NOTIFICATIONS_URL,
} from './endPoints'

export interface NotificationResponse {
  id: string
  fromUserId?: string
  postId?: string
  commentId?: string
  metadata?: { message?: string; shareCount?: number; count?: number }
  fromUserName: string
  fromUserAvatar: string | null
  type: string
  message: string
  timeAgo: string
  isRead: boolean
  timestamp?: number
}

export function getNotificationsApi(
  page = 1,
  limit = 50,
  type?: string
): Promise<AxiosResponse<{ data: NotificationResponse[] }>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_NOTIFICATIONS_URL,
    params: { page, limit, type },
  })
}

export function getUnreadCountApi(): Promise<AxiosResponse<{ data: { count: number } }>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_NOTIFICATIONS_UNREAD_COUNT_URL,
  })
}

export function markNotificationReadApi(id: string): Promise<AxiosResponse<{ data: { read: boolean } }>> {
  return networkClient().request({
    method: HTTP_METHOD.PUT,
    url: MARK_NOTIFICATION_READ_URL.replace('{id}', id),
  })
}

export function markAllNotificationsReadApi(): Promise<AxiosResponse<{ data: { read: boolean } }>> {
  return networkClient().request({
    method: HTTP_METHOD.PUT,
    url: MARK_ALL_NOTIFICATIONS_READ_URL,
  })
}

export function deleteNotificationApi(id: string): Promise<AxiosResponse<{ data: { deleted: boolean } }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: DELETE_NOTIFICATION_URL.replace('{id}', id),
  })
}

export function clearAllNotificationsApi(): Promise<AxiosResponse<{ data: { cleared: number } }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: CLEAR_ALL_NOTIFICATIONS_URL,
  })
}
