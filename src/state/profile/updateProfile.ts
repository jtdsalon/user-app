import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { updateProfileApi } from '@/services/api/userService'
import { uploadPostImageApi } from '@/services/api/feedService'
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

export const updateProfile = (payload: UserProfile) => ({ type: TYPES.UPDATE_PROFILE, payload })
export const setProfile = (payload: UserProfile | null) => ({ type: TYPES.SET_PROFILE, payload })
export const setSaving = (payload: boolean) => ({ type: TYPES.SET_SAVING, payload })

const updateProfileSuccess = (payload: UserProfile) => ({ type: TYPES.UPDATE_PROFILE_SUCCESS, payload })
const updateProfileError = (payload: any) => ({ type: TYPES.UPDATE_PROFILE_ERROR, payload })

export function* updateProfileSaga(action: { payload: UserProfile }): Generator<any, void, any> {
  try {
    const updated = action.payload
    let avatarUrl = updated.avatar
    if (avatarUrl && avatarUrl.startsWith('data:')) {
      const arr = avatarUrl.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
      const bstr = atob(arr[1])
      const u8arr = new Uint8Array(bstr.length)
      for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i)
      const file = new File([u8arr], 'avatar.jpg', { type: mime })
      const uploadRes: any = yield call(uploadPostImageApi, file)
      avatarUrl = uploadRes?.data?.data?.url || uploadRes?.data?.url || avatarUrl
    }
    const rawUsername = updated.handle?.replace(/^@/, '').trim()
    const payload: any = {
      name: updated.name,
      avatar: avatarUrl || undefined,
    }
    if (rawUsername && rawUsername.toLowerCase() !== 'user') {
      payload.username = rawUsername
    }
    const res: any = yield call(updateProfileApi, payload)
    const data = (res?.data as any)?.data ?? (res?.data as any)
    const profileData = data && typeof data === 'object' ? data : {}
    yield put(updateProfileSuccess(apiProfileToUserProfile(profileData)))
  } catch (err) {
    yield put(updateProfileError(err))
    throw err
  }
}
