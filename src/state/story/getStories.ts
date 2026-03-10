import { call, put } from 'redux-saga/effects'
import * as T from './types'
import { getStoriesApi } from '../../services/api/storyService'
import { HTTP_CODE } from '../../lib/enums/httpData'

export const getStories = () => ({
  type: T.GET_STORIES,
})

const getStoriesSuccess = (data: import('../../services/api/storyService').Story[]) => ({
  type: T.GET_STORIES_SUCCESS,
  payload: data,
})

const getStoriesError = (payload: any) => ({
  type: T.GET_STORIES_ERROR,
  payload,
})

export function* getStoriesSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(getStoriesApi)
    if (response?.status === HTTP_CODE.OK || response?.status === HTTP_CODE.CREATED) {
      const list = response?.data?.data ?? response?.data ?? []
      const data = Array.isArray(list) ? list : []
      yield put(getStoriesSuccess(data))
    } else {
      yield put(getStoriesError(response))
    }
  } catch (err) {
    yield put(getStoriesError(err))
  }
}
