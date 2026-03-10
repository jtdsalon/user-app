import type { Story } from '../../services/api/storyService'

export const GET_STORIES = 'GET_STORIES'
export const GET_STORIES_SUCCESS = 'GET_STORIES_SUCCESS'
export const GET_STORIES_ERROR = 'GET_STORIES_ERROR'

export const CREATE_STORY = 'CREATE_STORY'
export const CREATE_STORY_SUCCESS = 'CREATE_STORY_SUCCESS'
export const CREATE_STORY_ERROR = 'CREATE_STORY_ERROR'

export const DELETE_STORY = 'DELETE_STORY'
export const DELETE_STORY_SUCCESS = 'DELETE_STORY_SUCCESS'
export const DELETE_STORY_ERROR = 'DELETE_STORY_ERROR'

export interface StoryState {
  stories: Story[]
  loading: boolean
  error: any
  createLoading: boolean
  createError: any
  deleteError: any
}

export const INITIAL_STORY_STATE: StoryState = {
  stories: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  deleteError: null,
}

export type StoryAction =
  | { type: typeof GET_STORIES }
  | { type: typeof GET_STORIES_SUCCESS; payload: Story[] }
  | { type: typeof GET_STORIES_ERROR; payload: any }
  | { type: typeof CREATE_STORY; payload: { title: string; images: string[] } }
  | { type: typeof CREATE_STORY_SUCCESS; payload: Story }
  | { type: typeof CREATE_STORY_ERROR; payload: any }
  | { type: typeof DELETE_STORY; payload: string }
  | { type: typeof DELETE_STORY_SUCCESS; payload: string }
  | { type: typeof DELETE_STORY_ERROR; payload: any }
