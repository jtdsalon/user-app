import * as T from './types'
import type { StoryState, StoryAction } from './types'

export const storyReducer = (state: StoryState = T.INITIAL_STORY_STATE, action: StoryAction): StoryState => {
  switch (action.type) {
    case T.GET_STORIES:
      return { ...state, loading: true, error: null }
    case T.GET_STORIES_SUCCESS:
      return { ...state, loading: false, stories: action.payload, error: null }
    case T.GET_STORIES_ERROR:
      return { ...state, loading: false, error: action.payload }

    case T.CREATE_STORY:
      return { ...state, createLoading: true, createError: null }
    case T.CREATE_STORY_SUCCESS:
      return {
        ...state,
        createLoading: false,
        createError: null,
        stories: [action.payload, ...state.stories],
      }
    case T.CREATE_STORY_ERROR:
      return { ...state, createLoading: false, createError: action.payload }

    case T.DELETE_STORY:
      return { ...state, deleteError: null }
    case T.DELETE_STORY_SUCCESS:
      return {
        ...state,
        stories: state.stories.filter(s => s.id !== action.payload),
        deleteError: null,
      }
    case T.DELETE_STORY_ERROR:
      return { ...state, deleteError: action.payload }

    default:
      return state
  }
}
