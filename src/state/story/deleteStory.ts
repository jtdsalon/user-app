import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { deleteStoryApi } from '../../services/api/storyService'
import { HTTP_CODE } from '../../lib/enums/httpData'

export const deleteStory = (storyId: string) => ({
  type: T.DELETE_STORY,
  payload: storyId,
})

export function* deleteStorySaga(action: { payload: string }): Generator<any, void, any> {
  try {
    const response: any = yield call(deleteStoryApi, action.payload)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED || response?.status === 204) {
      yield put({ type: T.DELETE_STORY_SUCCESS, payload: action.payload })
    } else {
      yield put({ type: T.DELETE_STORY_ERROR, payload: response })
    }
  } catch (err) {
    yield put({ type: T.DELETE_STORY_ERROR, payload: err })
  }
}
