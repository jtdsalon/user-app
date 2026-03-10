// Auth state & action type definitions (following salon state pattern)

export interface User {
  id: string
  name: string
  email: string
  // add more fields as needed
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

// Initial state
export const INITIAL_STATE: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
}

// Action type constants
export const SIGNUP_REQUEST = 'AUTH/SIGNUP_REQUEST'
export const SIGNUP_SUCCESS = 'AUTH/SIGNUP_SUCCESS'
export const SIGNUP_FAILURE = 'AUTH/SIGNUP_FAILURE'

export const LOGIN_REQUEST = 'AUTH/LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'AUTH/LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'AUTH/LOGIN_FAILURE'

export const LOGOUT = 'AUTH/LOGOUT'

// Action interfaces
export interface SignupRequestAction {
  type: typeof SIGNUP_REQUEST
  payload: { name: string; email: string; password: string }
}

export interface SignupSuccessAction {
  type: typeof SIGNUP_SUCCESS
  payload: { user: User; token: string }
}

export interface SignupFailureAction {
  type: typeof SIGNUP_FAILURE
  payload: string
}

export interface LoginRequestAction {
  type: typeof LOGIN_REQUEST
  payload: { email: string; password: string; deviceFingerprint?: string | null }
}

export interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS
  payload: { user: User; token: string }
}

export interface LoginFailureAction {
  type: typeof LOGIN_FAILURE
  payload: string
}

export interface LogoutAction {
  type: typeof LOGOUT
}

export type AuthAction =
  | SignupRequestAction
  | SignupSuccessAction
  | SignupFailureAction
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | LogoutAction
