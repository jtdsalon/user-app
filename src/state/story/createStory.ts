import { call, put } from 'redux-saga/effects'
import * as T from './types'
import type { Story } from '../../services/api/storyService'
import { createStoryWithUploads } from '../../services/api/storyService'
import { HTTP_CODE } from '../../lib/enums/httpData'

export const createStory = (payload: { title: string; images: string[] }) => ({
  type: T.CREATE_STORY,
  payload,
})

export function* createStorySaga(action: { payload: { title: string; images: string[] } }): Generator<any, void, any> {
  try {
    const response: any = yield call(createStoryWithUploads, action.payload)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const raw = response?.data?.data ?? response?.data
      const story: Story = raw?.id ? raw : raw
      yield put({ type: T.CREATE_STORY_SUCCESS, payload: story })
    } else {
      yield put({ type: T.CREATE_STORY_ERROR, payload: response })
    }
  } catch (err) {
    yield put({ type: T.CREATE_STORY_ERROR, payload: err })
  }
}
