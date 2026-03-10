import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { followUserApi, unfollowUserApi } from '@/services/api/userService'

export const followProfile = (userId: string) => ({ type: TYPES.FOLLOW_PROFILE, payload: userId })
const followProfileSuccess = () => ({ type: TYPES.FOLLOW_PROFILE_SUCCESS })

export const unfollowProfile = (userId: string) => ({ type: TYPES.UNFOLLOW_PROFILE, payload: userId })
const unfollowProfileSuccess = () => ({ type: TYPES.UNFOLLOW_PROFILE_SUCCESS })

export function* followProfileSaga(action: { payload: string }): Generator<any, void, any> {
  try {
    yield call(followUserApi, action.payload)
    yield put(followProfileSuccess())
  } catch (err) {
    throw err
  }
}

export function* unfollowProfileSaga(action: { payload: string }): Generator<any, void, any> {
  try {
    yield call(unfollowUserApi, action.payload)
    yield put(unfollowProfileSuccess())
  } catch (err) {
    throw err
  }
}
