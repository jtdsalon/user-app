import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getProfileApi, getUserByIdApi } from '@/services/api/userService'
import type { UserProfile } from '@/components/Profile/types'

function apiProfileToUserProfile(raw: any): UserProfile {
  const name = raw?.name || [raw?.firstName, raw?.lastName].filter(Boolean).join(' ') || 'User'
  const handle = raw?.username ? (raw.username.startsWith('@') ? raw.username : `@${raw.username}`) : '@user'
  const followers = Number(raw?.followersCount ?? raw?.followers_count ?? 0)
  const following = Number(raw?.followingCount ?? raw?.following_count ?? 0)
  return {
    id: raw?.id || '',
    name,
    handle,
    avatar: raw?.avatar || '',
    bio: '',
    followers: Number.isFinite(followers) ? followers : 0,
    following: Number.isFinite(following) ? following : 0,
    postsCount: 0,
    type: 'customer',
    isFollowing: raw?.isFollowing ?? raw?.is_following ?? false,
  }
}

export const getProfile = (payload: { viewedUserId: string; isOwnProfile: boolean }) => ({
  type: TYPES.GET_PROFILE,
  payload,
})

const getProfileSuccess = (payload: UserProfile) => ({ type: TYPES.GET_PROFILE_SUCCESS, payload })
const getProfileError = (payload: string) => ({ type: TYPES.GET_PROFILE_ERROR, payload })

export function* getProfileSaga(action: { payload: { viewedUserId: string; isOwnProfile: boolean } }): Generator<any, void, any> {
  const { viewedUserId, isOwnProfile } = action.payload
  if (!viewedUserId) return
  try {
    const res: any = yield call(isOwnProfile ? getProfileApi : getUserByIdApi, viewedUserId)
    const data = (res?.data as any)?.data ?? (res?.data as any)
    const profileData = data && typeof data === 'object' ? data : {}
    const userProfile = apiProfileToUserProfile(profileData)
    yield put(getProfileSuccess(userProfile))
  } catch (err: any) {
    yield put(getProfileError(err?.message || 'Failed to load profile'))
  }
}
