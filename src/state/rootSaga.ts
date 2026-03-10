import { all, fork } from 'redux-saga/effects';
import { userSaga } from './user';
import { profileSaga } from './profile';
import { salonSaga } from './salon';
import { artisanSaga } from './artisan';
import { bookingSaga } from './booking/bookingSaga';
import { vacancySaga } from './vacancy';
import { feedSaga } from './feed';
import { storySaga } from './story';
import authSaga from './auth/authSaga';

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(userSaga),
    fork(profileSaga),
    fork(salonSaga),
    fork(artisanSaga),
    fork(bookingSaga),
    fork(vacancySaga),
    fork(feedSaga),
    fork(storySaga),
  ]);
}

export default rootSaga;
