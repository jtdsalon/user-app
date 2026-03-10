import { takeEvery } from 'redux-saga/effects'
import * as T from './types'
import { getStoriesSaga } from './getStories'
import { createStorySaga } from './createStory'
import { deleteStorySaga } from './deleteStory'

export function* storySaga() {
  yield takeEvery(T.GET_STORIES, getStoriesSaga as any)
  yield takeEvery(T.CREATE_STORY, createStorySaga as any)
  yield takeEvery(T.DELETE_STORY, deleteStorySaga as any)
}
