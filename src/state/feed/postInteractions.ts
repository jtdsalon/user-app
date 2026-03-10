import { call, put, select } from 'redux-saga/effects'
import * as T from './types'
import {
  deletePostApi,
  updatePostWithUploads,
  togglePostLikeApi,
  togglePostSaveApi,
  addPostCommentApi,
  updatePostCommentApi,
  deletePostCommentApi,
  togglePostCommentLikeApi,
} from '../../services/api/feedService'
import { mapApiPostToFeedPost } from '../../services/api/feedService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import type { RootState } from '../store'

export const deletePost = (postId: string) => ({
  type: T.DELETE_POST,
  payload: postId,
})

export const updatePost = (postId: string, data: Record<string, any>) => ({
  type: T.UPDATE_POST,
  payload: { postId, data },
})

export const togglePostLike = (postId: string) => ({
  type: T.TOGGLE_POST_LIKE,
  payload: postId,
})

export const togglePostSave = (postId: string) => ({
  type: T.TOGGLE_POST_SAVE,
  payload: postId,
})

export const addPostComment = (postId: string, comment: string) => ({
  type: T.ADD_POST_COMMENT,
  payload: { postId, comment },
})

export const updatePostComment = (postId: string, commentId: string, comment: string) => ({
  type: T.UPDATE_POST_COMMENT,
  payload: { postId, commentId, comment },
})

export const deletePostComment = (postId: string, commentId: string) => ({
  type: T.DELETE_POST_COMMENT,
  payload: { postId, commentId },
})

export const togglePostCommentLike = (postId: string, commentId: string) => ({
  type: T.TOGGLE_POST_COMMENT_LIKE,
  payload: { postId, commentId },
})

function* handlePostResponse(response: any) {
  if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
    const raw = response?.data?.data ?? response?.data
    const post = raw?.id ? mapApiPostToFeedPost(raw) : raw
    if (post) yield put({ type: T.UPDATE_FEED_POST, payload: post })
  }
}

export function* deletePostSaga(action: { payload: string }): Generator<any, void, any> {
  try {
    yield call(deletePostApi, action.payload)
    yield put({ type: T.DELETE_FEED_POST, payload: action.payload })
  } catch (err) {
    // Could add error toast
  }
}

export function* updatePostSaga(action: {
  payload: { postId: string; data: Record<string, any> }
}): Generator<any, void, any> {
  try {
    const { postId, data } = action.payload
    const response: any = yield call(updatePostWithUploads, postId, data)
    yield* handlePostResponse(response)
  } catch (err) {
    // Could add error toast
  }
}

export function* togglePostLikeSaga(action: { payload: string }): Generator<any, void, any> {
  const postId = action.payload
  const state: { posts: any[] } = yield select((s: RootState) => s.feed)
  const post = state.posts.find((p: any) => p.id === postId)
  const prevPost = post ? { ...post } : null

  // Optimistic update
  if (prevPost) {
    const optimisticPost = {
      ...prevPost,
      isLiked: !prevPost.isLiked,
      likes: prevPost.likes + (prevPost.isLiked ? -1 : 1),
    }
    yield put({ type: T.UPDATE_FEED_POST, payload: optimisticPost })
  }

  try {
    const response: any = yield call(togglePostLikeApi, postId)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? response?.data
      const updated = raw?.id ? mapApiPostToFeedPost(raw) : raw
      if (updated) yield put({ type: T.UPDATE_FEED_POST, payload: updated })
    } else if (prevPost) {
      yield put({ type: T.UPDATE_FEED_POST, payload: prevPost })
    }
  } catch (err) {
    if (prevPost) yield put({ type: T.UPDATE_FEED_POST, payload: prevPost })
  }
}

export function* togglePostSaveSaga(action: { payload: string }): Generator<any, void, any> {
  const postId = action.payload
  const state: { posts: any[] } = yield select((s: RootState) => s.feed)
  const post = state.posts.find((p: any) => p.id === postId)
  const prevPost = post ? { ...post } : null

  if (prevPost) {
    yield put({
      type: T.UPDATE_FEED_POST,
      payload: {
        ...prevPost,
        isSaved: !prevPost.isSaved,
      },
    })
  }

  try {
    const response: any = yield call(togglePostSaveApi, postId)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? response?.data
      const updated = raw?.id ? mapApiPostToFeedPost(raw) : raw
      if (updated) yield put({ type: T.UPDATE_FEED_POST, payload: updated })
    } else if (prevPost) {
      yield put({ type: T.UPDATE_FEED_POST, payload: prevPost })
    }
  } catch (err) {
    if (prevPost) yield put({ type: T.UPDATE_FEED_POST, payload: prevPost })
  }
}

export function* addPostCommentSaga(action: {
  payload: { postId: string; comment: string }
}): Generator<any, void, any> {
  try {
    const { postId, comment } = action.payload
    const response: any = yield call(addPostCommentApi, postId, comment)
    yield* handlePostResponse(response)
  } catch (err) {
    // Could add error toast
  }
}

export function* updatePostCommentSaga(action: {
  payload: { postId: string; commentId: string; comment: string }
}): Generator<any, void, any> {
  try {
    const { postId, commentId, comment } = action.payload
    const response: any = yield call(updatePostCommentApi, postId, commentId, comment)
    yield* handlePostResponse(response)
  } catch (err) {
    // Could add error toast
  }
}

export function* deletePostCommentSaga(action: {
  payload: { postId: string; commentId: string }
}): Generator<any, void, any> {
  try {
    const { postId, commentId } = action.payload
    const response: any = yield call(deletePostCommentApi, postId, commentId)
    yield* handlePostResponse(response)
  } catch (err) {
    // Could add error toast
  }
}

export function* togglePostCommentLikeSaga(action: {
  payload: { postId: string; commentId: string }
}): Generator<any, void, any> {
  try {
    const { postId, commentId } = action.payload
    const response: any = yield call(togglePostCommentLikeApi, postId, commentId)
    yield* handlePostResponse(response)
  } catch (err) {
    // Silently fail for comment like - could add error toast
  }
}
