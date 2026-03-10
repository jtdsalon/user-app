import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getPaginatedUsersApi } from '../../services/api/userService'
import { HTTP_CODE } from '../../lib/enums/httpData'
import type { UserAction, PaginationState, User } from './types'

interface PaginatedPayload {
  page: number
  pageSize: number
}

interface PaginatedResponse {
  data: User[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Action(s)
export const getPaginatedUsers = (payload: PaginatedPayload): UserAction => ({
  type: TYPES.GET_PAGINATED_USERS,
  payload: payload,
})

const getPaginatedUsersSuccess = (payload: PaginatedResponse): UserAction => ({
  type: TYPES.GET_PAGINATED_USERS_SUCCESS,
  payload: payload,
})

const getPaginatedUsersError = (error: any): UserAction => ({
  type: TYPES.GET_PAGINATED_USERS_ERROR,
  payload: error,
})

// Saga(s)
export function* getPaginatedUsersSaga(action: UserAction & { payload: PaginatedPayload }): Generator<any, void, any> {
  try {
    const { page, pageSize } = action.payload
    const response: any = yield call(getPaginatedUsersApi, page, pageSize)
    if (response.status === HTTP_CODE.OK) {
      yield put(getPaginatedUsersSuccess(response.data))
    }
  } catch (error) {
    yield put(getPaginatedUsersError(error))
  }
}
