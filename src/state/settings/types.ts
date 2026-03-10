import { UserSettings, NotificationSettings } from '../../services/api/settingsService'

// Settings Action Types
export const GET_SETTINGS = 'GET_SETTINGS'
export const GET_SETTINGS_SUCCESS = 'GET_SETTINGS_SUCCESS'
export const GET_SETTINGS_ERROR = 'GET_SETTINGS_ERROR'

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const UPDATE_SETTINGS_SUCCESS = 'UPDATE_SETTINGS_SUCCESS'
export const UPDATE_SETTINGS_ERROR = 'UPDATE_SETTINGS_ERROR'

export const UPDATE_PASSWORD = 'UPDATE_PASSWORD'
export const UPDATE_PASSWORD_SUCCESS = 'UPDATE_PASSWORD_SUCCESS'
export const UPDATE_PASSWORD_ERROR = 'UPDATE_PASSWORD_ERROR'

export const UPDATE_NOTIFICATIONS = 'UPDATE_NOTIFICATIONS'
export const UPDATE_NOTIFICATIONS_SUCCESS = 'UPDATE_NOTIFICATIONS_SUCCESS'
export const UPDATE_NOTIFICATIONS_ERROR = 'UPDATE_NOTIFICATIONS_ERROR'

export const UPDATE_TWO_FACTOR = 'UPDATE_TWO_FACTOR'
export const UPDATE_TWO_FACTOR_SUCCESS = 'UPDATE_TWO_FACTOR_SUCCESS'
export const UPDATE_TWO_FACTOR_ERROR = 'UPDATE_TWO_FACTOR_ERROR'

export const GET_ACTIVITY_LOG = 'GET_ACTIVITY_LOG'
export const GET_ACTIVITY_LOG_SUCCESS = 'GET_ACTIVITY_LOG_SUCCESS'
export const GET_ACTIVITY_LOG_ERROR = 'GET_ACTIVITY_LOG_ERROR'

export const DELETE_ACCOUNT = 'DELETE_ACCOUNT'
export const DELETE_ACCOUNT_SUCCESS = 'DELETE_ACCOUNT_SUCCESS'
export const DELETE_ACCOUNT_ERROR = 'DELETE_ACCOUNT_ERROR'

export const CLEAR_SETTINGS = 'CLEAR_SETTINGS'

export interface ActivityLogEntry {
  id: string
  action: string
  targetType: string
  targetId: string
  changes?: any
  createdAt: string
}

export interface SettingsState {
  settings: UserSettings | null
  activityLog: ActivityLogEntry[]
  loading: boolean
  error: any
  success: boolean
  message: string
}

export const INITIAL_STATE: SettingsState = {
  settings: null,
  activityLog: [],
  loading: false,
  error: null,
  success: false,
  message: '',
}

// Action Types
export type SettingsAction =
  | { type: typeof GET_SETTINGS; payload: string }
  | { type: typeof GET_SETTINGS_SUCCESS; payload: UserSettings }
  | { type: typeof GET_SETTINGS_ERROR; payload: any }
  | { type: typeof UPDATE_SETTINGS; payload: { userId: string; settingsData: any } }
  | { type: typeof UPDATE_SETTINGS_SUCCESS; payload: UserSettings }
  | { type: typeof UPDATE_SETTINGS_ERROR; payload: any }
  | { type: typeof UPDATE_PASSWORD; payload: { userId: string; passwordData: any } }
  | { type: typeof UPDATE_PASSWORD_SUCCESS; payload: string }
  | { type: typeof UPDATE_PASSWORD_ERROR; payload: any }
  | { type: typeof UPDATE_NOTIFICATIONS; payload: { userId: string; notificationData: NotificationSettings } }
  | { type: typeof UPDATE_NOTIFICATIONS_SUCCESS; payload: UserSettings }
  | { type: typeof UPDATE_NOTIFICATIONS_ERROR; payload: any }
  | { type: typeof UPDATE_TWO_FACTOR; payload: { userId: string; enabled: boolean } }
  | { type: typeof UPDATE_TWO_FACTOR_SUCCESS; payload: UserSettings }
  | { type: typeof UPDATE_TWO_FACTOR_ERROR; payload: any }
  | { type: typeof GET_ACTIVITY_LOG; payload: { userId: string; limit?: number; offset?: number } }
  | { type: typeof GET_ACTIVITY_LOG_SUCCESS; payload: ActivityLogEntry[] }
  | { type: typeof GET_ACTIVITY_LOG_ERROR; payload: any }
  | { type: typeof DELETE_ACCOUNT; payload: { userId: string; password: string } }
  | { type: typeof DELETE_ACCOUNT_SUCCESS; payload: string }
  | { type: typeof DELETE_ACCOUNT_ERROR; payload: any }
  | { type: typeof CLEAR_SETTINGS }
