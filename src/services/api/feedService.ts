import { AxiosResponse } from 'axios'
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import {
  GET_POSTS_URL,
  GET_FAVOURITES_FEED_URL,
  GET_PUBLIC_FEED_URL,
  GET_SAVED_FEED_URL,
  GET_POST_URL,
  CREATE_POST_URL,
  UPDATE_POST_URL,
  DELETE_POST_URL,
  UPLOAD_POST_IMAGE_URL,
  TOGGLE_POST_LIKE_URL,
  TOGGLE_POST_SAVE_URL,
  GET_POST_LIKERS_URL,
  GET_POST_COMMENT_LIKERS_URL,
  ADD_POST_COMMENT_URL,
  UPDATE_POST_COMMENT_URL,
  DELETE_POST_COMMENT_URL,
  TOGGLE_POST_COMMENT_LIKE_URL,
} from './endPoints'
import type { FeedPost, Comment } from '../../components/Feed/types'

export interface FeedPostsResponse {
  data: FeedPost[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export interface PostResponse {
  data: FeedPost
}

export function getFeedPostsApi(
  page = 1,
  limit = 20
): Promise<AxiosResponse<FeedPostsResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_POSTS_URL,
    params: { page, limit },
  })
}

export function getFavouritesFeedPostsApi(
  page = 1,
  limit = 20
): Promise<AxiosResponse<FeedPostsResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_FAVOURITES_FEED_URL,
    params: { page, limit },
  })
}

export function getPublicFeedPostsApi(
  page = 1,
  limit = 20
): Promise<AxiosResponse<FeedPostsResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_PUBLIC_FEED_URL,
    params: { page, limit },
  })
}

export function getSavedFeedPostsApi(
  page = 1,
  limit = 20
): Promise<AxiosResponse<FeedPostsResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_SAVED_FEED_URL,
    params: { page, limit },
  })
}

export function getPostByIdApi(postId: string): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_POST_URL.replace('{postId}', postId),
  })
}

export interface CreatePostPayload {
  content?: string
  caption?: string
  image_url?: string
  image?: string
  image_before_url?: string
  image_before?: string
  is_transformation?: boolean
  salon_id?: string
  parent_post_id?: string
}

export function createPostApi(payload: CreatePostPayload): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: CREATE_POST_URL,
    data: payload,
  })
}

export function updatePostApi(
  postId: string,
  payload: CreatePostPayload
): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.PUT,
    url: UPDATE_POST_URL.replace('{postId}', postId),
    data: payload,
  })
}

export function deletePostApi(postId: string): Promise<AxiosResponse<{ data: Record<string, never> }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: DELETE_POST_URL.replace('{postId}', postId),
  })
}

export function uploadPostImageApi(file: File): Promise<AxiosResponse<{ data: { url: string } }>> {
  const formData = new FormData()
  formData.append('image', file)
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: UPLOAD_POST_IMAGE_URL,
    data: formData,
  })
}

export function togglePostLikeApi(postId: string): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: TOGGLE_POST_LIKE_URL.replace('{postId}', postId),
  })
}

export function togglePostSaveApi(postId: string): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: TOGGLE_POST_SAVE_URL.replace('{postId}', postId),
  })
}

export interface PostLiker {
  id: string
  name: string
  handle: string
  avatar: string
}

export interface PostLikersResponse {
  data: PostLiker[]
}

export function getPostLikersApi(postId: string): Promise<AxiosResponse<PostLikersResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_POST_LIKERS_URL.replace('{postId}', postId),
  })
}

export function getPostCommentLikersApi(postId: string, commentId: string): Promise<AxiosResponse<PostLikersResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_POST_COMMENT_LIKERS_URL.replace('{postId}', postId).replace('{commentId}', commentId),
  })
}

export function addPostCommentApi(
  postId: string,
  comment: string
): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: ADD_POST_COMMENT_URL.replace('{postId}', postId),
    data: { comment },
  })
}

export function updatePostCommentApi(
  postId: string,
  commentId: string,
  comment: string
): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.PUT,
    url: UPDATE_POST_COMMENT_URL.replace('{postId}', postId).replace('{commentId}', commentId),
    data: { comment },
  })
}

export function deletePostCommentApi(
  postId: string,
  commentId: string
): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: DELETE_POST_COMMENT_URL.replace('{postId}', postId).replace('{commentId}', commentId),
  })
}

export function togglePostCommentLikeApi(
  postId: string,
  commentId: string
): Promise<AxiosResponse<PostResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: TOGGLE_POST_COMMENT_LIKE_URL.replace('{postId}', postId).replace('{commentId}', commentId),
  })
}

function getUploadedImageUrl(response: { data?: { data?: { url?: string } } & { url?: string } }): string | undefined {
  return response?.data?.data?.url || response?.data?.url
}

/** Convert data URL to File for upload */
function dataUrlToFile(dataUrl: string, filename = 'image.jpg'): File {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

/** Create post with optional image uploads (handles data URLs) */
export async function createPostWithUploads(
  payload: CreatePostPayload & { image?: string; image_before?: string }
): Promise<AxiosResponse<PostResponse>> {
  let imageUrl = payload.image_url || payload.image
  let imageBeforeUrl = payload.image_before_url || payload.image_before

  if (imageUrl && imageUrl.startsWith('data:')) {
    const file = dataUrlToFile(imageUrl)
    const uploadRes = await uploadPostImageApi(file)
    imageUrl = getUploadedImageUrl(uploadRes)
  }
  if (imageBeforeUrl && imageBeforeUrl.startsWith('data:')) {
    const file = dataUrlToFile(imageBeforeUrl, 'image-before.jpg')
    const uploadRes = await uploadPostImageApi(file)
    imageBeforeUrl = getUploadedImageUrl(uploadRes)
  }

  return createPostApi({
    content: payload.content || payload.caption,
    image_url: imageUrl,
    image_before_url: imageBeforeUrl,
    is_transformation: payload.is_transformation,
    salon_id: payload.salon_id,
    parent_post_id: payload.parent_post_id,
  })
}

/** Update post with optional image uploads (handles data URLs) */
export async function updatePostWithUploads(
  postId: string,
  payload: CreatePostPayload & { image?: string; image_before?: string }
): Promise<AxiosResponse<PostResponse>> {
  let imageUrl = payload.image_url || payload.image
  let imageBeforeUrl = payload.image_before_url || payload.image_before

  if (imageUrl && imageUrl.startsWith('data:')) {
    const file = dataUrlToFile(imageUrl)
    const uploadRes = await uploadPostImageApi(file)
    imageUrl = getUploadedImageUrl(uploadRes)
  }
  if (imageBeforeUrl && imageBeforeUrl.startsWith('data:')) {
    const file = dataUrlToFile(imageBeforeUrl, 'image-before.jpg')
    const uploadRes = await uploadPostImageApi(file)
    imageBeforeUrl = getUploadedImageUrl(uploadRes)
  }

  return updatePostApi(postId, {
    content: payload.content || payload.caption,
    image_url: imageUrl,
    image_before_url: imageBeforeUrl,
    is_transformation: payload.is_transformation,
    salon_id: payload.salon_id,
  })
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  skincare: ['skincare', 'skin', 'face', 'serum', 'moisturizer', 'cleanser'],
  hair: ['hair', 'hairstyle', 'cut', 'color', 'balayage'],
  nails: ['nails', 'nail', 'manicure', 'pedicure'],
  makeup: ['makeup', 'lipstick', 'eyeshadow', 'blush', 'foundation'],
  wellness: ['wellness', 'spa', 'massage', 'relax'],
};

function inferCategory(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return undefined;
}

/** Map API post to FeedPost (for backward compat if API shape differs) */
export function mapApiPostToFeedPost(raw: any): FeedPost {
  const mappedParentPost = raw.parentPost || raw.parent_feed || raw.parentFeed
    ? mapApiPostToFeedPost(raw.parentPost || raw.parent_feed || raw.parentFeed)
    : null;
  const image = raw.image;
  const imageBefore = raw.imageBefore;
  const caption = raw.caption;
  const isTransformation = !!(raw.isTransformation && image && imageBefore);
  return {
    id: raw.id,
    userId: raw.userId,
    userName: raw.userName,
    userAvatar: raw.userAvatar,
    userType: raw.userType || 'customer',
    authorSalonId: raw.authorSalonId ?? null,
    caption,
    image,
    imageBefore,
    isTransformation,
    category: raw.category || inferCategory(caption),
    timeAgo: raw.timeAgo,
    likes: raw.likes ?? 0,
    isLiked: raw.liked ?? raw.isLiked,
    isSaved: raw.saved ?? raw.isSaved,
    repostsCount: raw.repostsCount ?? raw.reposts_count ?? 0,
    parentPost: mappedParentPost,
    comments: (raw.comments ?? []).map((c: any) => ({
      id: c.id,
      userId: c.userId,
      userName: c.userName,
      userAvatar: c.userAvatar,
      userType: (c.userType as 'customer' | 'salon' | 'page') || 'customer',
      text: c.text,
      timeAgo: c.timeAgo,
      likes: c.likes ?? 0,
      isLiked: c.isLiked,
    })),
  }
}
