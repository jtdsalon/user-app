import { createStore, combineReducers, applyMiddleware, Store, Reducer, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { userReducer } from './user'
import { profileReducer } from './profile'
import { salonReducer } from './salon'
import { artisanReducer } from './artisan'
import { bookingReducer } from './booking/reducer'
import { vacancyReducer } from './vacancy'
import { feedReducer } from './feed'
import { storyReducer } from './story'
import { rootSaga } from './rootSaga'
import { RESET } from './actions'
import type { UserState, UserAction } from './user'
import type { ProfileState } from './profile'
import type { SalonState } from './salon'
import type { ArtisanState } from './artisan'
import type { BookingState } from './booking/types'
import type { VacancyState } from './vacancy'
import type { FeedState } from './feed'
import type { StoryState, StoryAction } from './story'

export interface RootState {
  user: UserState
  profile: ProfileState
  salon: SalonState
  artisan: ArtisanState
  booking: BookingState
  vacancy: VacancyState
  feed: FeedState
  story: StoryState
}

export type AppAction = UserAction | StoryAction | { type: typeof RESET }

const sagaMiddleware = createSagaMiddleware()

const combined = combineReducers({
  user: userReducer,
  profile: profileReducer,
  salon: salonReducer,
  artisan: artisanReducer,
  booking: bookingReducer,
  vacancy: vacancyReducer,
  feed: feedReducer,
  story: storyReducer,
})

const rootReducer: Reducer<RootState, AppAction> = (state, action) => {
  if (action.type === RESET) {
    return combined(undefined, action as any) as RootState
  }
  return combined(state, action) as RootState
}

/* Check if current environment is localhost:5174 */
const isLocalhost = window.location.hostname === 'localhost' && window.location.port === '5174';

/* Create a composeEnhancers function that includes Redux DevTools extension only if current environment is localhost:5174 and the extension is available */
const composeEnhancers = isLocalhost && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store: Store<RootState, AppAction> = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
)

sagaMiddleware.run(rootSaga)

export default store
