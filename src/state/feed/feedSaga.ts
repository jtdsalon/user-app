import { takeEvery } from 'redux-saga/effects'
import * as T from './types'
import {
  getFeedPostsSaga,
  getFavouritesFeedPostsSaga,
  getPublicFeedPostsSaga,
  getSavedFeedPostsSaga,
} from './getFeedPosts'
import { createPostSaga } from './createPost'
import {
  deletePostSaga,
  updatePostSaga,
  togglePostLikeSaga,
  togglePostSaveSaga,
  addPostCommentSaga,
  updatePostCommentSaga,
  deletePostCommentSaga,
  togglePostCommentLikeSaga,
} from './postInteractions'

export function* feedSaga() {
  yield takeEvery(T.GET_FEED_POSTS, getFeedPostsSaga as any)
  yield takeEvery(T.GET_FAVOURITES_FEED_POSTS, getFavouritesFeedPostsSaga as any)
  yield takeEvery(T.GET_PUBLIC_FEED_POSTS, getPublicFeedPostsSaga as any)
  yield takeEvery(T.GET_SAVED_FEED_POSTS, getSavedFeedPostsSaga as any)
  yield takeEvery(T.CREATE_POST, createPostSaga as any)
  yield takeEvery(T.DELETE_POST, deletePostSaga as any)
  yield takeEvery(T.UPDATE_POST, updatePostSaga as any)
  yield takeEvery(T.TOGGLE_POST_LIKE, togglePostLikeSaga as any)
  yield takeEvery(T.TOGGLE_POST_SAVE, togglePostSaveSaga as any)
  yield takeEvery(T.ADD_POST_COMMENT, addPostCommentSaga as any)
  yield takeEvery(T.UPDATE_POST_COMMENT, updatePostCommentSaga as any)
  yield takeEvery(T.DELETE_POST_COMMENT, deletePostCommentSaga as any)
  yield takeEvery(T.TOGGLE_POST_COMMENT_LIKE, togglePostCommentLikeSaga as any)
}
