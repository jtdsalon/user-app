import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getUserApi } from '../../services/api/userService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import type { UserAction, User } from './types'

// Action(s)
export const getUser = (payload: string): UserAction => ({
  type: TYPES.GET_USER,
  payload: payload,
})

const getUserSuccess = (payload: User): UserAction => ({
  type: TYPES.GET_USER_SUCCESS,
  payload: payload,
})

const getUserError = (error: any): UserAction => ({
  type: TYPES.GET_USER_ERROR,
  payload: error,
})

// Saga(s)
export function* getUserSaga(action: UserAction & { payload: string }): Generator<any, void, any> {
  try {
    const response: any = yield call(getUserApi, action.payload)
    if (response.status === HTTP_CODE.OK) {
      yield put(getUserSuccess(response.data))
    }
  } catch (error) {
    yield put(getUserError(error))
  }
}
