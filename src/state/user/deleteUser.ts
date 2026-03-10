import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { deleteUserApi } from '../../services/api/userService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import type { UserAction } from './types'

// Action(s)
export const deleteUser = (payload: string): UserAction => ({
  type: TYPES.DELETE_USER,
  payload: payload,
})

const deleteUserSuccess = (payload: string): UserAction => ({
  type: TYPES.DELETE_USER_SUCCESS,
  payload: payload,
})

const deleteUserError = (error: any): UserAction => ({
  type: TYPES.DELETE_USER_ERROR,
  payload: error,
})

// Saga(s)
export function* deleteUserSaga(action: UserAction & { payload: string }): Generator<any, void, any> {
  try {
    const response: any = yield call(deleteUserApi, action.payload)
    if (response.status === HTTP_CODE.OK || response.status === HTTP_CODE.NO_CONTENT) {
      yield put(deleteUserSuccess(action.payload))
    }
  } catch (error) {
    yield put(deleteUserError(error))
  }
}
