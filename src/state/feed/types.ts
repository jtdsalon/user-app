import type { FeedPost } from '../../components/Feed/types'

export const GET_FEED_POSTS = 'GET_FEED_POSTS'
export const GET_FEED_POSTS_SUCCESS = 'GET_FEED_POSTS_SUCCESS'
export const GET_FEED_POSTS_ERROR = 'GET_FEED_POSTS_ERROR'

export const GET_FAVOURITES_FEED_POSTS = 'GET_FAVOURITES_FEED_POSTS'
export const GET_FAVOURITES_FEED_POSTS_SUCCESS = 'GET_FAVOURITES_FEED_POSTS_SUCCESS'
export const GET_FAVOURITES_FEED_POSTS_ERROR = 'GET_FAVOURITES_FEED_POSTS_ERROR'

export const GET_PUBLIC_FEED_POSTS = 'GET_PUBLIC_FEED_POSTS'
export const GET_PUBLIC_FEED_POSTS_SUCCESS = 'GET_PUBLIC_FEED_POSTS_SUCCESS'
export const GET_PUBLIC_FEED_POSTS_ERROR = 'GET_PUBLIC_FEED_POSTS_ERROR'

export const GET_SAVED_FEED_POSTS = 'GET_SAVED_FEED_POSTS'
export const GET_SAVED_FEED_POSTS_SUCCESS = 'GET_SAVED_FEED_POSTS_SUCCESS'
export const GET_SAVED_FEED_POSTS_ERROR = 'GET_SAVED_FEED_POSTS_ERROR'

export const UPDATE_FEED_POST = 'UPDATE_FEED_POST'
export const DELETE_FEED_POST = 'DELETE_FEED_POST'
export const ADD_FEED_POST = 'ADD_FEED_POST'

export const CREATE_POST = 'CREATE_POST'
export const CREATE_POST_SUCCESS = 'CREATE_POST_SUCCESS'
export const CREATE_POST_ERROR = 'CREATE_POST_ERROR'

export const DELETE_POST = 'DELETE_POST'
export const UPDATE_POST = 'UPDATE_POST'
export const TOGGLE_POST_LIKE = 'TOGGLE_POST_LIKE'
export const TOGGLE_POST_SAVE = 'TOGGLE_POST_SAVE'
export const ADD_POST_COMMENT = 'ADD_POST_COMMENT'
export const UPDATE_POST_COMMENT = 'UPDATE_POST_COMMENT'
export const DELETE_POST_COMMENT = 'DELETE_POST_COMMENT'
export const TOGGLE_POST_COMMENT_LIKE = 'TOGGLE_POST_COMMENT_LIKE'

export interface FeedSliceState {
  posts: FeedPost[]
  loading: boolean
  loadingMore: boolean
  error: any
  page: number
  total: number
  /** True after initial load was requested (stops empty-result loop) */
  requestedOnce: boolean
}

export const INITIAL_FEED_SLICE: FeedSliceState = {
  posts: [],
  loading: false,
  loadingMore: false,
  error: null,
  page: 1,
  total: 0,
  requestedOnce: false,
}

export interface FeedState {
  /** @deprecated Use favourites and public instead */
  posts: FeedPost[]
  loading: boolean
  error: any
  favourites: FeedSliceState
  public: FeedSliceState
  saved: FeedSliceState
  createLoading: boolean
  createError: any
}

export const INITIAL_FEED_STATE: FeedState = {
  posts: [],
  loading: false,
  error: null,
  favourites: { ...INITIAL_FEED_SLICE },
  public: { ...INITIAL_FEED_SLICE },
  saved: { ...INITIAL_FEED_SLICE },
  createLoading: false,
  createError: null,
}

export type FeedAction =
  | { type: typeof GET_FEED_POSTS; meta?: { silent?: boolean } }
  | { type: typeof GET_FEED_POSTS_SUCCESS; payload: { data: FeedPost[] } }
  | { type: typeof GET_FEED_POSTS_ERROR; payload: any }
  | { type: typeof GET_FAVOURITES_FEED_POSTS; payload?: { page?: number; limit?: number; silent?: boolean } }
  | { type: typeof GET_FAVOURITES_FEED_POSTS_SUCCESS; payload: { data: FeedPost[]; page: number; total: number; append?: boolean } }
  | { type: typeof GET_FAVOURITES_FEED_POSTS_ERROR; payload: any }
  | { type: typeof GET_PUBLIC_FEED_POSTS; payload?: { page?: number; limit?: number; silent?: boolean } }
  | { type: typeof GET_PUBLIC_FEED_POSTS_SUCCESS; payload: { data: FeedPost[]; page: number; total: number; append?: boolean } }
  | { type: typeof GET_PUBLIC_FEED_POSTS_ERROR; payload: any }
  | { type: typeof GET_SAVED_FEED_POSTS; payload?: { page?: number; limit?: number; silent?: boolean } }
  | { type: typeof GET_SAVED_FEED_POSTS_SUCCESS; payload: { data: FeedPost[]; page: number; total: number; append?: boolean } }
  | { type: typeof GET_SAVED_FEED_POSTS_ERROR; payload: any }
  | { type: typeof UPDATE_FEED_POST; payload: FeedPost }
  | { type: typeof DELETE_FEED_POST; payload: string }
  | { type: typeof ADD_FEED_POST; payload: FeedPost }
  | { type: typeof CREATE_POST; payload: Record<string, any> }
  | { type: typeof CREATE_POST_SUCCESS; payload: FeedPost }
  | { type: typeof CREATE_POST_ERROR; payload: any }
  | { type: typeof DELETE_POST; payload: string }
  | { type: typeof UPDATE_POST; payload: { postId: string; data: Record<string, any> } }
  | { type: typeof TOGGLE_POST_LIKE; payload: string }
  | { type: typeof TOGGLE_POST_SAVE; payload: string }
  | { type: typeof ADD_POST_COMMENT; payload: { postId: string; comment: string } }
  | { type: typeof UPDATE_POST_COMMENT; payload: { postId: string; commentId: string; comment: string } }
  | { type: typeof DELETE_POST_COMMENT; payload: { postId: string; commentId: string } }
  | { type: typeof TOGGLE_POST_COMMENT_LIKE; payload: { postId: string; commentId: string } }
