import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { updateUserApi } from '../../services/api/userService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import type { UserAction, User } from './types'

interface UpdatePayload {
  userId: string
  userData: Partial<User>
}

// Action(s)
export const updateUser = (payload: UpdatePayload): UserAction => ({
  type: TYPES.UPDATE_USER,
  payload: payload,
})

const updateUserSuccess = (payload: User): UserAction => ({
  type: TYPES.UPDATE_USER_SUCCESS,
  payload: payload,
})

const updateUserError = (error: any): UserAction => ({
  type: TYPES.UPDATE_USER_ERROR,
  payload: error,
})

// Saga(s)
export function* updateUserSaga(action: UserAction & { payload: UpdatePayload }): Generator<any, void, any> {
  try {
    const { userId, userData } = action.payload
    const response: any = yield call(updateUserApi, userId, userData)
    if (response.status === HTTP_CODE.OK) {
      yield put(updateUserSuccess(response.data))
    }
  } catch (error) {
    yield put(updateUserError(error))
  }
}
