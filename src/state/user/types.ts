// User Action Types
export const GET_USER = 'GET_USER'
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS'
export const GET_USER_ERROR = 'GET_USER_ERROR'

export const ADD_USER = 'ADD_USER'
export const ADD_USER_SUCCESS = 'ADD_USER_SUCCESS'
export const ADD_USER_ERROR = 'ADD_USER_ERROR'

export const UPDATE_USER = 'UPDATE_USER'
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS'
export const UPDATE_USER_ERROR = 'UPDATE_USER_ERROR'

export const GET_ALL_USERS = 'GET_ALL_USERS'
export const GET_ALL_USERS_SUCCESS = 'GET_ALL_USERS_SUCCESS'
export const GET_ALL_USERS_ERROR = 'GET_ALL_USERS_ERROR'

export const GET_PAGINATED_USERS = 'GET_PAGINATED_USERS'
export const GET_PAGINATED_USERS_SUCCESS = 'GET_PAGINATED_USERS_SUCCESS'
export const GET_PAGINATED_USERS_ERROR = 'GET_PAGINATED_USERS_ERROR'

export const DELETE_USER = 'DELETE_USER'
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS'
export const DELETE_USER_ERROR = 'DELETE_USER_ERROR'

export const CLEAR_USER = 'CLEAR_USER'

export interface User {
  id: string
  name: string
  email: string
  [key: string]: any
}

export interface PaginationState {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserState {
  user: User | null
  users: User[]
  pagination: PaginationState
  loading: boolean
  error: any
  isAuthenticated: boolean
  success: boolean
}

export const INITIAL_STATE: UserState = {
  user: null,
  users: [],
  pagination: {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  },
  loading: false,
  error: null,
  isAuthenticated: false,
  success: false,
}

// Action Types - Use discriminated union for better type safety
export type UserAction =
  | { type: typeof GET_USER; payload: string }
  | { type: typeof GET_USER_SUCCESS; payload: User }
  | { type: typeof GET_USER_ERROR; payload: any }
  | { type: typeof ADD_USER; payload: Partial<User> }
  | { type: typeof ADD_USER_SUCCESS; payload: User }
  | { type: typeof ADD_USER_ERROR; payload: any }
  | { type: typeof UPDATE_USER; payload: { userId: string; userData: Partial<User> } }
  | { type: typeof UPDATE_USER_SUCCESS; payload: User }
  | { type: typeof UPDATE_USER_ERROR; payload: any }
  | { type: typeof GET_ALL_USERS }
  | { type: typeof GET_ALL_USERS_SUCCESS; payload: User[] }
  | { type: typeof GET_ALL_USERS_ERROR; payload: any }
  | { type: typeof GET_PAGINATED_USERS; payload: { page: number; pageSize: number } }
  | { type: typeof GET_PAGINATED_USERS_SUCCESS; payload: { data: User[]; total: number; page: number; pageSize: number; totalPages: number } }
  | { type: typeof GET_PAGINATED_USERS_ERROR; payload: any }
  | { type: typeof DELETE_USER; payload: string }
  | { type: typeof DELETE_USER_SUCCESS; payload: string }
  | { type: typeof DELETE_USER_ERROR; payload: any }
  | { type: typeof CLEAR_USER }
