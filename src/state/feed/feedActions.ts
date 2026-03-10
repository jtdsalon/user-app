import * as T from './types'
import type { FeedPost } from '../../components/Feed/types'

export const updateFeedPost = (post: FeedPost) => ({
  type: T.UPDATE_FEED_POST,
  payload: post,
})

export const deleteFeedPost = (id: string) => ({
  type: T.DELETE_FEED_POST,
  payload: id,
})

export const addFeedPost = (post: FeedPost) => ({
  type: T.ADD_FEED_POST,
  payload: post,
})
