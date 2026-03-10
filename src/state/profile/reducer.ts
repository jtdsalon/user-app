import * as TYPES from './types'
import type { ProfileState, ProfileAction } from './types'

export function profileReducer(
  state: ProfileState = TYPES.INITIAL_STATE,
  action: ProfileAction
): ProfileState {
  switch (action.type) {
    case TYPES.GET_PROFILE:
      return { ...state, loading: true, error: null }
    case TYPES.GET_PROFILE_SUCCESS:
      return { ...state, loading: false, profile: action.payload, error: null }
    case TYPES.GET_PROFILE_ERROR:
      return { ...state, loading: false, profile: null, error: action.payload }

    case TYPES.UPDATE_PROFILE:
      return { ...state, saving: true }
    case TYPES.UPDATE_PROFILE_SUCCESS:
      return { ...state, saving: false, profile: action.payload }
    case TYPES.UPDATE_PROFILE_ERROR:
      return { ...state, saving: false }

    case TYPES.SET_PROFILE:
      return { ...state, profile: action.payload }

    case TYPES.SET_SAVING:
      return { ...state, saving: action.payload }

    case TYPES.FOLLOW_PROFILE_SUCCESS:
      return state.profile
        ? {
            ...state,
            profile: {
              ...state.profile,
              isFollowing: true,
              followers: (state.profile.followers || 0) + 1,
            },
          }
        : state
    case TYPES.UNFOLLOW_PROFILE_SUCCESS:
      return state.profile
        ? {
            ...state,
            profile: {
              ...state.profile,
              isFollowing: false,
              followers: Math.max(0, (state.profile.followers || 0) - 1),
            },
          }
        : state

    default:
      return state
  }
}
