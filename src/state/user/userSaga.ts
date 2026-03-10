import { takeEvery } from 'redux-saga/effects'
import * as TYPES from './types'
import { getUserSaga } from './getUser'
import { addUserSaga } from './addUser'
import { updateUserSaga } from './updateUser'
import { getUserAllSaga } from './getUserAll'
import { getPaginatedUsersSaga } from './getPaginatedUsers'
import { deleteUserSaga } from './deleteUser'

export function* userSaga() {
  yield takeEvery(TYPES.GET_USER, getUserSaga)
  yield takeEvery(TYPES.ADD_USER, addUserSaga)
  yield takeEvery(TYPES.UPDATE_USER, updateUserSaga)
  yield takeEvery(TYPES.GET_ALL_USERS, getUserAllSaga)
  yield takeEvery(TYPES.GET_PAGINATED_USERS, getPaginatedUsersSaga)
  yield takeEvery(TYPES.DELETE_USER, deleteUserSaga)
}
