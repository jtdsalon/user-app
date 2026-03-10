import { call, put, takeEvery } from 'redux-saga/effects'
import * as TYPES from './types'
import {
  getSettingsApi,
  updateSettingsApi,
  updatePasswordApi,
  updateNotificationsApi,
  updateTwoFactorApi,
  getActivityLogApi,
  deleteAccountApi,
} from '../../services/api/settingsService'

// Get Settings
export function* getSettingsSaga(action: TYPES.SettingsAction) {
  if (action.type !== TYPES.GET_SETTINGS) return
  try {
    const response = yield call(getSettingsApi, action.payload)
    yield put({ type: TYPES.GET_SETTINGS_SUCCESS, payload: response.data.data })
  } catch (error: any) {
    yield put({ type: TYPES.GET_SETTINGS_ERROR, payload: error.response?.data || error.message })
  }
}

// Update Settings
export function* updateSettingsSaga(action: TYPES.SettingsAction) {
  if (action.type !== TYPES.UPDATE_SETTINGS) return
  try {
    const { userId, settingsData } = action.payload
    const response = yield call(updateSettingsApi, userId, settingsData)
    yield put({ type: TYPES.UPDATE_SETTINGS_SUCCESS, payload: response.data.data })
  } catch (error: any) {
    yield put({ type: TYPES.UPDATE_SETTINGS_ERROR, payload: error.response?.data || error.message })
  }
}

// Update Password
export function* updatePasswordSaga(action: TYPES.SettingsAction) {
  if (action.type !== TYPES.UPDATE_PASSWORD) return
  try {
    const { userId, passwordData } = action.payload
    const response = yield call(updatePasswordApi, userId, passwordData)
    yield put({ type: TYPES.UPDATE_PASSWORD_SUCCESS, payload: response.data.message })
  } catch (error: any) {
    yield put({ type: TYPES.UPDATE_PASSWORD_ERROR, payload: error.response?.data || error.message })
  }
}

// Update Notifications
export function* updateNotificationsSaga(action: TYPES.SettingsAction) {
  if (action.type !== TYPES.UPDATE_NOTIFICATIONS) return
  try {
    const { userId, notificationData } = action.payload
    const response = yield call(updateNotificationsApi, userId, notificationData)
    yield put({ type: TYPES.UPDATE_NOTIFICATIONS_SUCCESS, payload: response.data.data })
  } catch (error: any) {
    yield put({ type: TYPES.UPDATE_NOTIFICATIONS_ERROR, payload: error.response?.data || error.message })
  }
}

// Update Two Factor
export function* updateTwoFactorSaga(action: TYPES.SettingsAction) {
  if (action.type !== TYPES.UPDATE_TWO_FACTOR) return
  try {
    const { userId, enabled } = action.payload
    const response = yield call(updateTwoFactorApi, userId, enabled)
    yield put({ type: TYPES.UPDATE_TWO_FACTOR_SUCCESS, payload: response.data.data })
  } catch (error: any) {
    yield put({ type: TYPES.UPDATE_TWO_FACTOR_ERROR, payload: error.response?.data || error.message })
  }
}

// Get Activity Log
export function* getActivityLogSaga(action: TYPES.SettingsAction) {
  if (action.type !== TYPES.GET_ACTIVITY_LOG) return
  try {
    const { userId, limit = 10, offset = 0 } = action.payload
    const response = yield call(getActivityLogApi, userId, limit, offset)
    yield put({ type: TYPES.GET_ACTIVITY_LOG_SUCCESS, payload: response.data.data.data })
  } catch (error: any) {
    yield put({ type: TYPES.GET_ACTIVITY_LOG_ERROR, payload: error.response?.data || error.message })
  }
}

// Delete Account
export function* deleteAccountSaga(action: TYPES.SettingsAction) {
  if (action.type !== TYPES.DELETE_ACCOUNT) return
  try {
    const { userId, password } = action.payload
    const response = yield call(deleteAccountApi, userId, password)
    yield put({ type: TYPES.DELETE_ACCOUNT_SUCCESS, payload: response.data.message })
  } catch (error: any) {
    yield put({ type: TYPES.DELETE_ACCOUNT_ERROR, payload: error.response?.data || error.message })
  }
}

// Root Saga
export function* settingsSaga() {
  yield takeEvery(TYPES.GET_SETTINGS, getSettingsSaga)
  yield takeEvery(TYPES.UPDATE_SETTINGS, updateSettingsSaga)
  yield takeEvery(TYPES.UPDATE_PASSWORD, updatePasswordSaga)
  yield takeEvery(TYPES.UPDATE_NOTIFICATIONS, updateNotificationsSaga)
  yield takeEvery(TYPES.UPDATE_TWO_FACTOR, updateTwoFactorSaga)
  yield takeEvery(TYPES.GET_ACTIVITY_LOG, getActivityLogSaga)
  yield takeEvery(TYPES.DELETE_ACCOUNT, deleteAccountSaga)
}
