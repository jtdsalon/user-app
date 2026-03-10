import { call, put } from 'redux-saga/effects'
import * as T from './types'
import type { FeedPost } from '../../components/Feed/types'
import {
  getFeedPostsApi,
  getFavouritesFeedPostsApi,
  getPublicFeedPostsApi,
  getSavedFeedPostsApi,
  mapApiPostToFeedPost,
} from '../../services/api/feedService'
import { HTTP_CODE } from '../../lib/enums/httpData'

const LIMIT = 20

/** @param meta.silent - when true, does not set loading (avoids unmounting feed on like/comment) */
export const getFeedPosts = (meta?: { silent?: boolean }) => ({
  type: T.GET_FEED_POSTS,
  meta,
})

const getFeedPostsSuccess = (data: FeedPost[]) => ({
  type: T.GET_FEED_POSTS_SUCCESS,
  payload: { data },
})

const getFeedPostsError = (payload: any) => ({
  type: T.GET_FEED_POSTS_ERROR,
  payload,
})

export function* getFeedPostsSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(getFeedPostsApi, 1, 50)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? []
      const data = Array.isArray(raw) ? raw.map((p: any) => (p?.id ? mapApiPostToFeedPost(p) : p)) : []
      yield put(getFeedPostsSuccess(data))
    } else {
      yield put(getFeedPostsError(response))
    }
  } catch (err) {
    yield put(getFeedPostsError(err))
  }
}

/** Favourites feed: own + followed salons/pages + followed users. Server-side pagination. */
export const getFavouritesFeedPosts = (payload?: { page?: number; limit?: number; silent?: boolean }) => ({
  type: T.GET_FAVOURITES_FEED_POSTS,
  payload,
})

export function* getFavouritesFeedPostsSaga(action: { type: string; payload?: { page?: number; limit?: number; silent?: boolean } }): Generator<any, void, any> {
  const page = action.payload?.page ?? 1
  const limit = action.payload?.limit ?? LIMIT
  const append = page > 1
  try {
    const response: any = yield call(getFavouritesFeedPostsApi, page, limit)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? []
      const data = Array.isArray(raw) ? raw.map((p: any) => (p?.id ? mapApiPostToFeedPost(p) : p)) : []
      const total = response?.data?.pagination?.total ?? data.length
      yield put({
        type: T.GET_FAVOURITES_FEED_POSTS_SUCCESS,
        payload: { data, page, total, append },
      })
    } else {
      yield put({ type: T.GET_FAVOURITES_FEED_POSTS_ERROR, payload: response })
    }
  } catch (err) {
    yield put({ type: T.GET_FAVOURITES_FEED_POSTS_ERROR, payload: err })
  }
}

/** Public (Discover) feed: posts not from favourites. Server-side pagination. */
export const getPublicFeedPosts = (payload?: { page?: number; limit?: number; silent?: boolean }) => ({
  type: T.GET_PUBLIC_FEED_POSTS,
  payload,
})

export function* getPublicFeedPostsSaga(action: { type: string; payload?: { page?: number; limit?: number; silent?: boolean } }): Generator<any, void, any> {
  const page = action.payload?.page ?? 1
  const limit = action.payload?.limit ?? LIMIT
  const append = page > 1
  try {
    const response: any = yield call(getPublicFeedPostsApi, page, limit)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? []
      const data = Array.isArray(raw) ? raw.map((p: any) => (p?.id ? mapApiPostToFeedPost(p) : p)) : []
      const total = response?.data?.pagination?.total ?? data.length
      yield put({
        type: T.GET_PUBLIC_FEED_POSTS_SUCCESS,
        payload: { data, page, total, append },
      })
    } else {
      yield put({ type: T.GET_PUBLIC_FEED_POSTS_ERROR, payload: response })
    }
  } catch (err) {
    yield put({ type: T.GET_PUBLIC_FEED_POSTS_ERROR, payload: err })
  }
}

export const getSavedFeedPosts = (payload?: { page?: number; limit?: number; silent?: boolean }) => ({
  type: T.GET_SAVED_FEED_POSTS,
  payload,
})

export function* getSavedFeedPostsSaga(action: { type: string; payload?: { page?: number; limit?: number; silent?: boolean } }): Generator<any, void, any> {
  const page = action.payload?.page ?? 1
  const limit = action.payload?.limit ?? LIMIT
  const append = page > 1
  try {
    const response: any = yield call(getSavedFeedPostsApi, page, limit)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? []
      const data = Array.isArray(raw) ? raw.map((p: any) => (p?.id ? mapApiPostToFeedPost(p) : p)) : []
      const total = response?.data?.pagination?.total ?? data.length
      yield put({
        type: T.GET_SAVED_FEED_POSTS_SUCCESS,
        payload: { data, page, total, append },
      })
    } else {
      yield put({ type: T.GET_SAVED_FEED_POSTS_ERROR, payload: response })
    }
  } catch (err) {
    yield put({ type: T.GET_SAVED_FEED_POSTS_ERROR, payload: err })
  }
}
