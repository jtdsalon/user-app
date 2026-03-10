import { call, put, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { signupApi, loginApi } from '@services/api/userService';
import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  type SignupRequestAction,
  type LoginRequestAction,
} from './types';

function* handleSignup(action: SignupRequestAction): SagaIterator {
  try {
    const response = yield call(signupApi, action.payload);
    yield put({ type: SIGNUP_SUCCESS, payload: { user: response.data, token: '' } });
  } catch (error: any) {
    yield put({ type: SIGNUP_FAILURE, payload: error.message });
  }
}

function* handleLogin(action: LoginRequestAction): SagaIterator {
  try {
    const response = yield call(loginApi, action.payload);
    yield put({ type: LOGIN_SUCCESS, payload: response.data });
  } catch (error: any) {
    yield put({ type: LOGIN_FAILURE, payload: error.message });
  }
}

export default function* authSaga(): SagaIterator {
  yield takeLatest(SIGNUP_REQUEST, handleSignup);
  yield takeLatest(LOGIN_REQUEST, handleLogin);
}