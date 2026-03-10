import * as TYPES from './types'

export function settingsReducer(state = TYPES.INITIAL_STATE, action: TYPES.SettingsAction): TYPES.SettingsState {
  switch (action.type) {
    case TYPES.GET_SETTINGS:
    case TYPES.UPDATE_SETTINGS:
    case TYPES.UPDATE_PASSWORD:
    case TYPES.UPDATE_NOTIFICATIONS:
    case TYPES.UPDATE_TWO_FACTOR:
    case TYPES.GET_ACTIVITY_LOG:
    case TYPES.DELETE_ACCOUNT:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
        message: '',
      }

    case TYPES.GET_SETTINGS_SUCCESS:
    case TYPES.UPDATE_SETTINGS_SUCCESS:
    case TYPES.UPDATE_NOTIFICATIONS_SUCCESS:
    case TYPES.UPDATE_TWO_FACTOR_SUCCESS:
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
        success: true,
        message: 'Settings updated successfully',
      }

    case TYPES.UPDATE_PASSWORD_SUCCESS:
    case TYPES.DELETE_ACCOUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: true,
        message: action.payload,
      }

    case TYPES.GET_ACTIVITY_LOG_SUCCESS:
      return {
        ...state,
        activityLog: action.payload,
        loading: false,
        error: null,
        success: true,
      }

    case TYPES.GET_SETTINGS_ERROR:
    case TYPES.UPDATE_SETTINGS_ERROR:
    case TYPES.UPDATE_PASSWORD_ERROR:
    case TYPES.UPDATE_NOTIFICATIONS_ERROR:
    case TYPES.UPDATE_TWO_FACTOR_ERROR:
    case TYPES.GET_ACTIVITY_LOG_ERROR:
    case TYPES.DELETE_ACCOUNT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
        message: action.payload?.message || 'An error occurred',
      }

    case TYPES.CLEAR_SETTINGS:
      return TYPES.INITIAL_STATE

    default:
      return state
  }
}
