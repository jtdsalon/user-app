import { useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@/components/Auth/AuthContext'
import {
  getProfile,
  updateProfile,
  setProfile,
  setSaving,
  followProfile,
  unfollowProfile,
} from '@/state/profile'
import {
  getProfileApi,
  updateProfileApi,
  getUserByIdApi,
  getFollowersApi,
  getFollowingApi,
} from '@/services/api/userService'
import { uploadPostImageApi } from '@/services/api/feedService'
import type { FollowerUser } from '@/services/api/userService'
import type { RootState } from '@/state/store'

export function useProfileAction() {
  const { id } = useParams<{ id: string }>()
  const { user: authUser } = useAuth()
  const dispatch = useDispatch()
  const currentUserId = authUser?.id || (authUser as any)?.sub

  const { profile, loading, saving, error } = useSelector((state: RootState) => state.profile)

  const viewedUserId = id || currentUserId
  const isOwnProfile = !id || id === currentUserId

  useEffect(() => {
    if (!viewedUserId) return
    dispatch(getProfile({ viewedUserId, isOwnProfile }) as any)
  }, [viewedUserId, isOwnProfile, dispatch])

  const refetch = useCallback(() => {
    if (viewedUserId) dispatch(getProfile({ viewedUserId, isOwnProfile }) as any)
  }, [viewedUserId, isOwnProfile, dispatch])

  const updateProfileAction = useCallback(
    async (updated: Parameters<typeof updateProfile>[0]) => {
      if (!isOwnProfile || !currentUserId) return
      dispatch(setSaving(true) as any)
      try {
        let avatarUrl = updated.avatar
        if (avatarUrl && avatarUrl.startsWith('data:')) {
          const arr = avatarUrl.split(',')
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
          const bstr = atob(arr[1])
          const u8arr = new Uint8Array(bstr.length)
          for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i)
          const file = new File([u8arr], 'avatar.jpg', { type: mime })
          const uploadRes = await uploadPostImageApi(file)
          avatarUrl = (uploadRes?.data as any)?.data?.url || (uploadRes?.data as any)?.url
        }
        const avatarForApi =
          avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('http')
            ? (() => {
                try {
                  return new URL(avatarUrl).pathname
                } catch {
                  return avatarUrl
                }
              })()
            : avatarUrl
        const rawUsername = updated.handle?.replace(/^@/, '').trim()
        const payload: any = {
          name: updated.name,
          avatar: avatarForApi || undefined,
        }
        if (rawUsername && rawUsername.toLowerCase() !== 'user') {
          payload.username = rawUsername
        }
        const res = await updateProfileApi(payload)
        const raw = (res?.data as any)?.data ?? (res?.data as any)
        const profileData =
          raw && typeof raw === 'object' && raw.data && typeof raw.data === 'object'
            ? raw.data
            : raw && typeof raw === 'object'
              ? raw
              : {}
        const name = profileData?.name || [profileData?.firstName, profileData?.lastName].filter(Boolean).join(' ') || 'User'
        const handle = profileData?.username ? (profileData.username.startsWith('@') ? profileData.username : `@${profileData.username}`) : '@user'
        const followers = Number(profileData?.followersCount ?? profileData?.followers_count ?? 0)
        const following = Number(profileData?.followingCount ?? profileData?.following_count ?? 0)
        const avatarValue = profileData?.avatar ?? ''
        dispatch(setProfile({
          id: profileData?.id || '',
          name,
          handle,
          avatar: avatarValue,
          bio: '',
          followers: Number.isFinite(followers) ? followers : 0,
          following: Number.isFinite(following) ? following : 0,
          postsCount: 0,
          type: 'customer',
          isFollowing: profileData?.isFollowing ?? profileData?.is_following ?? false,
        }) as any)
        const storedUserStr = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null
        if (storedUserStr && avatarValue) {
          try {
            const stored = JSON.parse(storedUserStr) as Record<string, unknown>
            if (stored && (stored.id === profileData?.id || stored.id === currentUserId)) {
              const merged = { ...stored, avatar: avatarValue, name: name || stored.name, firstName: profileData?.firstName ?? stored.firstName, lastName: profileData?.lastName ?? stored.lastName }
              localStorage.setItem('user', JSON.stringify(merged))
              window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: merged }))
            }
          } catch (_) {}
        }
        dispatch(getProfile({ viewedUserId, isOwnProfile }) as any)
      } catch (err) {
        throw err
      } finally {
        dispatch(setSaving(false) as any)
      }
    },
    [isOwnProfile, currentUserId, dispatch]
  )

  const followUser = useCallback(async () => {
    if (!viewedUserId || isOwnProfile || !currentUserId) return
    await dispatch(followProfile(viewedUserId) as any)
  }, [viewedUserId, isOwnProfile, currentUserId, dispatch])

  const unfollowUser = useCallback(async () => {
    if (!viewedUserId || isOwnProfile || !currentUserId) return
    await dispatch(unfollowProfile(viewedUserId) as any)
  }, [viewedUserId, isOwnProfile, currentUserId, dispatch])

  const fetchFollowers = useCallback(
    async (page = 1, limit = 20): Promise<FollowerUser[]> => {
      if (!viewedUserId) return []
      const res = await getFollowersApi(viewedUserId, page, limit)
      return (res?.data as any)?.data ?? []
    },
    [viewedUserId]
  )

  const fetchFollowing = useCallback(
    async (page = 1, limit = 20): Promise<FollowerUser[]> => {
      if (!viewedUserId) return []
      const res = await getFollowingApi(viewedUserId, page, limit)
      return (res?.data as any)?.data ?? []
    },
    [viewedUserId]
  )

  return {
    profile,
    loading,
    error,
    saving,
    viewedUserId,
    isOwnProfile,
    refetch,
    updateProfile: updateProfileAction,
    followUser,
    unfollowUser,
    fetchFollowers,
    fetchFollowing,
  }
}
