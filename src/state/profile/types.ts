import type { UserProfile } from '@/components/Profile/types'

export const GET_PROFILE = 'GET_PROFILE'
export const GET_PROFILE_SUCCESS = 'GET_PROFILE_SUCCESS'
export const GET_PROFILE_ERROR = 'GET_PROFILE_ERROR'

export const UPDATE_PROFILE = 'UPDATE_PROFILE'
export const UPDATE_PROFILE_SUCCESS = 'UPDATE_PROFILE_SUCCESS'
export const UPDATE_PROFILE_ERROR = 'UPDATE_PROFILE_ERROR'
export const SET_PROFILE = 'SET_PROFILE'
export const SET_SAVING = 'SET_SAVING'

export const FOLLOW_PROFILE = 'FOLLOW_PROFILE'
export const FOLLOW_PROFILE_SUCCESS = 'FOLLOW_PROFILE_SUCCESS'
export const UNFOLLOW_PROFILE = 'UNFOLLOW_PROFILE'
export const UNFOLLOW_PROFILE_SUCCESS = 'UNFOLLOW_PROFILE_SUCCESS'

export interface ProfileState {
  profile: UserProfile | null
  loading: boolean
  saving: boolean
  error: string | null
}

export const INITIAL_STATE: ProfileState = {
  profile: null,
  loading: false,
  saving: false,
  error: null,
}

export type ProfileAction =
  | { type: typeof GET_PROFILE; payload: { viewedUserId: string; isOwnProfile: boolean } }
  | { type: typeof GET_PROFILE_SUCCESS; payload: UserProfile }
  | { type: typeof GET_PROFILE_ERROR; payload: string }
  | { type: typeof UPDATE_PROFILE; payload: UserProfile }
  | { type: typeof UPDATE_PROFILE_SUCCESS; payload: UserProfile }
  | { type: typeof UPDATE_PROFILE_ERROR; payload: any }
  | { type: typeof SET_PROFILE; payload: UserProfile | null }
  | { type: typeof SET_SAVING; payload: boolean }
  | { type: typeof FOLLOW_PROFILE; payload: string }
  | { type: typeof FOLLOW_PROFILE_SUCCESS }
  | { type: typeof UNFOLLOW_PROFILE; payload: string }
  | { type: typeof UNFOLLOW_PROFILE_SUCCESS }
