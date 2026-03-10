import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { createPostWithUploads } from '../../services/api/feedService'
import { mapApiPostToFeedPost } from '../../services/api/feedService'
import { HTTP_CODE } from '../../lib/enums/httpData'

export const createPost = (payload: Record<string, any>) => ({
  type: T.CREATE_POST,
  payload,
})

export function* createPostSaga(action: { payload: Record<string, any> }): Generator<any, void, any> {
  try {
    const response: any = yield call(createPostWithUploads, action.payload)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? response?.data
      const post = raw?.id ? mapApiPostToFeedPost(raw) : raw
      yield put({ type: T.CREATE_POST_SUCCESS, payload: post })
    } else {
      yield put({ type: T.CREATE_POST_ERROR, payload: response })
    }
  } catch (err) {
    yield put({ type: T.CREATE_POST_ERROR, payload: err })
  }
}
