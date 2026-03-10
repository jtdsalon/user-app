import * as TYPES from './types'
import type { UserState, UserAction } from './types'

export const userReducer = (state: UserState = TYPES.INITIAL_STATE, action: UserAction): UserState => {
  switch (action.type) {
    // Get User
    case TYPES.GET_USER:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case TYPES.GET_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      }
    case TYPES.GET_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      }

    // Add User
    case TYPES.ADD_USER:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      }
    case TYPES.ADD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: [...state.users, action.payload],
        success: true,
        error: null,
      }
    case TYPES.ADD_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      }

    // Update User
    case TYPES.UPDATE_USER:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      }
    case TYPES.UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
        success: true,
        error: null,
      }
    case TYPES.UPDATE_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      }

    // Get All Users
    case TYPES.GET_ALL_USERS:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case TYPES.GET_ALL_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload,
        error: null,
      }
    case TYPES.GET_ALL_USERS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    // Get Paginated Users
    case TYPES.GET_PAGINATED_USERS:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case TYPES.GET_PAGINATED_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload.data,
        pagination: {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        },
        error: null,
      }
    case TYPES.GET_PAGINATED_USERS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    // Delete User
    case TYPES.DELETE_USER:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      }
    case TYPES.DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter((u) => u.id !== action.payload),
        success: true,
        error: null,
      }
    case TYPES.DELETE_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      }

    // Clear User
    case TYPES.CLEAR_USER:
      return TYPES.INITIAL_STATE

    default:
      return state
  }
}