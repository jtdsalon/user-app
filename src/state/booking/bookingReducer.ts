import * as T from './types'

type Action =
  | { type: typeof T.OPEN_BOOKING; payload: { salon: T.BookingState['salon']; artist: T.BookingState['artist']; preselectedServiceId?: string | null } }
  | { type: typeof T.CLOSE_BOOKING }
  | { type: typeof T.LOAD_BOOKING_DATA; payload: { salon: T.BookingState['salon']; artist: T.BookingState['artist']; preselectedServiceId?: string | null } }
  | { type: typeof T.LOAD_BOOKING_DATA_SUCCESS; payload: { services: T.BookingService[]; staff: T.BookingStaff[]; lookbook: T.LookbookItem[]; bookingRules?: T.BookingRules | null } }
  | { type: typeof T.LOAD_BOOKING_DATA_ERROR; payload: string }
  | { type: typeof T.LOAD_AVAILABILITY; payload: void }
  | { type: typeof T.LOAD_AVAILABILITY_SUCCESS; payload: T.TimeSlot[] }
  | { type: typeof T.LOAD_AVAILABILITY_ERROR; payload: string }
  | { type: typeof T.SUBMIT_BOOKING; payload: void }
  | { type: typeof T.SUBMIT_BOOKING_SUCCESS; payload: void }
  | { type: typeof T.SUBMIT_BOOKING_ERROR; payload: string }
  | { type: typeof T.LOAD_LAST_BOOKED; payload: void }
  | { type: typeof T.LOAD_LAST_BOOKED_SUCCESS; payload: T.BookingState['lastBooked'] }

export function bookingReducer(
  state: T.BookingState = T.INITIAL_BOOKING_STATE,
  action: Action
): T.BookingState {
  switch (action.type) {
    case T.OPEN_BOOKING:
      return {
        ...state,
        salon: action.payload.salon,
        artist: action.payload.artist,
        preselectedServiceId: action.payload.preselectedServiceId ?? null,
        isOpen: true,
        error: null,
        submitError: null,
      }
    case T.CLOSE_BOOKING:
      return { ...T.INITIAL_BOOKING_STATE, lastBooked: state.lastBooked }
    case T.LOAD_BOOKING_DATA:
      return {
        ...state,
        salon: action.payload.salon,
        artist: action.payload.artist,
        preselectedServiceId: action.payload.preselectedServiceId ?? state.preselectedServiceId,
        isOpen: true,
        loading: true,
        error: null,
      }
    case T.LOAD_BOOKING_DATA_SUCCESS:
      return {
        ...state,
        services: action.payload.services,
        staff: action.payload.staff,
        lookbook: action.payload.lookbook || [],
        bookingRules: action.payload.bookingRules ?? null,
        loading: false,
        error: null,
      }
    case T.LOAD_BOOKING_DATA_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case T.LOAD_AVAILABILITY:
      return {
        ...state,
        availabilityLoading: true,
      }
    case T.LOAD_AVAILABILITY_SUCCESS:
      return {
        ...state,
        availability: action.payload,
        availabilityLoading: false,
      }
    case T.LOAD_AVAILABILITY_ERROR:
      return {
        ...state,
        availabilityLoading: false,
      }
    case T.SUBMIT_BOOKING:
      return {
        ...state,
        submitLoading: true,
        submitError: null,
      }
    case T.SUBMIT_BOOKING_SUCCESS:
      return {
        ...state,
        submitLoading: false,
        submitError: null,
        isOpen: false,
      }
    case T.SUBMIT_BOOKING_ERROR:
      return {
        ...state,
        submitLoading: false,
        submitError: action.payload,
      }
    case T.LOAD_LAST_BOOKED_SUCCESS:
      return {
        ...state,
        lastBooked: action.payload,
      }
    default:
      return state
  }
}
