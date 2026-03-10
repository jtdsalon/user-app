import * as T from './types'
import type { FeedState, FeedAction } from './types'
import type { FeedPost } from '../../components/Feed/types'

const updatePostInSlices = (state: FeedState, updated: FeedPost) => ({
  ...state,
  favourites: {
    ...state.favourites,
    posts: state.favourites.posts.map((p) => (p.id === updated.id ? updated : p)),
  },
  public: {
    ...state.public,
    posts: state.public.posts.map((p) => (p.id === updated.id ? updated : p)),
  },
  saved: {
    ...state.saved,
    posts: updated.isSaved === false
      ? state.saved.posts.filter((p) => p.id !== updated.id)
      : state.saved.posts.map((p) => (p.id === updated.id ? updated : p)),
  },
  posts: state.posts.map((p) => (p.id === updated.id ? updated : p)),
})

const removePostFromSlices = (state: FeedState, postId: string) => ({
  ...state,
  favourites: {
    ...state.favourites,
    posts: state.favourites.posts.filter((p) => p.id !== postId),
  },
  public: {
    ...state.public,
    posts: state.public.posts.filter((p) => p.id !== postId),
  },
  saved: {
    ...state.saved,
    posts: state.saved.posts.filter((p) => p.id !== postId),
  },
  posts: state.posts.filter((p) => p.id !== postId),
})

export const feedReducer = (state: FeedState = T.INITIAL_FEED_STATE, action: FeedAction): FeedState => {
  switch (action.type) {
    case T.GET_FEED_POSTS:
      return action.meta?.silent ? state : { ...state, loading: true, error: null }
    case T.GET_FEED_POSTS_SUCCESS:
      return { ...state, loading: false, posts: action.payload.data, error: null }
    case T.GET_FEED_POSTS_ERROR:
      return { ...state, loading: false, error: action.payload }

    case T.GET_FAVOURITES_FEED_POSTS: {
      const silent = action.payload?.silent
      const page = action.payload?.page ?? 1
      const isLoadMore = page > 1
      if (silent) return state
      return {
        ...state,
        favourites: {
          ...state.favourites,
          loading: !isLoadMore,
          loadingMore: isLoadMore,
          error: null,
          requestedOnce: state.favourites.requestedOnce || page === 1,
        },
      }
    }
    case T.GET_FAVOURITES_FEED_POSTS_SUCCESS: {
      const { data, page, total, append } = action.payload
      const posts = append ? [...state.favourites.posts, ...data] : data
      return {
        ...state,
        favourites: { ...state.favourites, posts, loading: false, loadingMore: false, error: null, page, total },
      }
    }
    case T.GET_FAVOURITES_FEED_POSTS_ERROR:
      return {
        ...state,
        favourites: { ...state.favourites, loading: false, loadingMore: false, error: action.payload },
      }

    case T.GET_PUBLIC_FEED_POSTS: {
      const silent = action.payload?.silent
      const page = action.payload?.page ?? 1
      const isLoadMore = page > 1
      if (silent) return state
      return {
        ...state,
        public: {
          ...state.public,
          loading: !isLoadMore,
          loadingMore: isLoadMore,
          error: null,
          requestedOnce: state.public.requestedOnce || page === 1,
        },
      }
    }
    case T.GET_PUBLIC_FEED_POSTS_SUCCESS: {
      const { data, page, total, append } = action.payload
      const posts = append ? [...state.public.posts, ...data] : data
      return {
        ...state,
        public: { ...state.public, posts, loading: false, loadingMore: false, error: null, page, total },
      }
    }
    case T.GET_PUBLIC_FEED_POSTS_ERROR:
      return {
        ...state,
        public: { ...state.public, loading: false, loadingMore: false, error: action.payload },
      }

    case T.GET_SAVED_FEED_POSTS: {
      const silent = action.payload?.silent
      const page = action.payload?.page ?? 1
      const isLoadMore = page > 1
      if (silent) return state
      return {
        ...state,
        saved: {
          ...state.saved,
          loading: !isLoadMore,
          loadingMore: isLoadMore,
          error: null,
          requestedOnce: state.saved.requestedOnce || page === 1,
        },
      }
    }
    case T.GET_SAVED_FEED_POSTS_SUCCESS: {
      const { data, page, total, append } = action.payload
      const posts = append ? [...state.saved.posts, ...data] : data
      return {
        ...state,
        saved: { ...state.saved, posts, loading: false, loadingMore: false, error: null, page, total },
      }
    }
    case T.GET_SAVED_FEED_POSTS_ERROR:
      return {
        ...state,
        saved: { ...state.saved, loading: false, loadingMore: false, error: action.payload },
      }

    case T.CREATE_POST:
      return { ...state, createLoading: true, createError: null }
    case T.CREATE_POST_SUCCESS: {
      const newPost = action.payload
      return {
        ...state,
        createLoading: false,
        createError: null,
        posts: [newPost, ...state.posts],
        favourites: {
          ...state.favourites,
          posts: [newPost, ...state.favourites.posts],
          total: state.favourites.total + 1,
        },
      }
    }
    case T.CREATE_POST_ERROR:
      return { ...state, createLoading: false, createError: action.payload }

    case T.UPDATE_FEED_POST:
      return updatePostInSlices(state, action.payload)
    case T.DELETE_FEED_POST:
      return removePostFromSlices(state, action.payload)
    case T.ADD_FEED_POST:
      return { ...state, posts: [action.payload, ...state.posts] }

    default:
      return state
  }
}
