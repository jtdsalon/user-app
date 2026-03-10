import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getUsersApi } from '../../services/api/userService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import type { UserAction, User } from './types'

// Action(s)
export const getUserAll = (): UserAction => ({
  type: TYPES.GET_ALL_USERS,
})

const getUsersAllSuccess = (payload: User[]): UserAction => ({
  type: TYPES.GET_ALL_USERS_SUCCESS,
  payload: payload,
})

const getUsersAllError = (error: any): UserAction => ({
  type: TYPES.GET_ALL_USERS_ERROR,
  payload: error,
})

// Saga(s)
export function* getUserAllSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(getUsersApi)
    if (response.status === HTTP_CODE.OK) {
      yield put(getUsersAllSuccess(response.data))
    }
  } catch (error) {
    yield put(getUsersAllError(error))
  }
}
