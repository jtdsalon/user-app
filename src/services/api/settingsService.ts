import { AxiosResponse } from 'axios'
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import {
  GET_SETTINGS_URL,
  UPDATE_SETTINGS_URL,
  UPDATE_PASSWORD_URL,
  UPDATE_NOTIFICATIONS_URL,
  UPDATE_TWO_FACTOR_URL,
  GET_ACTIVITY_LOG_URL,
  DELETE_ACCOUNT_URL,
} from './endPoints'

export interface UserSettings {
  id: string
  userId: string
  name?: string
  email?: string
  phone?: string
  bio?: string
  avatarUrl?: string
  twoFactor?: boolean
  notifications?: {
    email?: boolean
    sms?: boolean
    system?: boolean
    marketing?: boolean
    newBookings?: boolean
    dailyReports?: boolean
    systemUpdates?: boolean
  }
  createdAt?: string
  updatedAt?: string
}

export interface UpdateSettingsPayload {
  name?: string
  email?: string
  phone?: string
  bio?: string
  avatar_url?: string
}

export interface UpdatePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface NotificationSettings {
  email?: boolean
  sms?: boolean
  system?: boolean
  marketing?: boolean
  newBookings?: boolean
  dailyReports?: boolean
  systemUpdates?: boolean
}

export interface ActivityLog {
  data: Array<{
    id: string
    action: string
    targetType: string
    targetId: string
    changes?: any
    createdAt: string
  }>
  total: number
  limit: number
  offset: number
}

// Get user settings
export function getSettingsApi(userId: string): Promise<AxiosResponse<{ success: boolean; data: UserSettings }>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SETTINGS_URL.replace('{userid}', userId),
  })
}

// Update user settings
export function updateSettingsApi(
  userId: string,
  settingsData: UpdateSettingsPayload
): Promise<AxiosResponse<{ success: boolean; data: UserSettings }>> {
  return networkClient().request({
    method: HTTP_METHOD.PUT,
    url: UPDATE_SETTINGS_URL.replace('{userid}', userId),
    data: settingsData,
  })
}

// Update password
export function updatePasswordApi(
  userId: string,
  passwordData: UpdatePasswordPayload
): Promise<AxiosResponse<{ success: boolean; message: string }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: UPDATE_PASSWORD_URL.replace('{userid}', userId),
    data: passwordData,
  })
}

// Update notifications
export function updateNotificationsApi(
  userId: string,
  notificationData: NotificationSettings
): Promise<AxiosResponse<{ success: boolean; data: UserSettings }>> {
  return networkClient().request({
    method: HTTP_METHOD.PUT,
    url: UPDATE_NOTIFICATIONS_URL.replace('{userid}', userId),
    data: notificationData,
  })
}

// Toggle two-factor authentication
export function updateTwoFactorApi(
  userId: string,
  enabled: boolean
): Promise<AxiosResponse<{ success: boolean; data: UserSettings }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: UPDATE_TWO_FACTOR_URL.replace('{userid}', userId),
    data: { enabled },
  })
}

// Get activity log
export function getActivityLogApi(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<AxiosResponse<{ success: boolean; data: ActivityLog }>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_ACTIVITY_LOG_URL.replace('{userid}', userId),
    params: { limit, offset },
  })
}

// Delete account
export function deleteAccountApi(userId: string, password: string): Promise<AxiosResponse<{ success: boolean; message: string }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: DELETE_ACCOUNT_URL.replace('{userid}', userId),
    data: { password },
  })
}
