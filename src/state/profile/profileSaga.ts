import { takeEvery } from 'redux-saga/effects'
import * as TYPES from './types'
import { getProfileSaga } from './getProfile'
import { followProfileSaga, unfollowProfileSaga } from './followProfile'

export function* profileSaga() {
  yield takeEvery(TYPES.GET_PROFILE, getProfileSaga)
  yield takeEvery(TYPES.FOLLOW_PROFILE, followProfileSaga)
  yield takeEvery(TYPES.UNFOLLOW_PROFILE, unfollowProfileSaga)
}
