import { AxiosResponse } from 'axios'
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import {
  GET_STORIES_URL,
  GET_STORY_URL,
  CREATE_STORY_URL,
  DELETE_STORY_URL,
  UPLOAD_STORY_IMAGE_URL,
} from './endPoints'
export interface Story {
  id: string
  userId: string
  name: string
  avatar: string
  images: string[]
  title: string
}

export interface StoriesResponse {
  data: Story[]
}

export interface StoryResponse {
  data: Story
}

export function getStoriesApi(limit = 50): Promise<AxiosResponse<StoriesResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_STORIES_URL,
    params: { limit },
  })
}

export function getStoryByIdApi(storyId: string): Promise<AxiosResponse<StoryResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_STORY_URL.replace('{storyId}', storyId),
  })
}

export interface CreateStoryPayload {
  title?: string
  images: string[]
}

export function createStoryApi(payload: CreateStoryPayload): Promise<AxiosResponse<StoryResponse>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: CREATE_STORY_URL,
    data: payload,
  })
}

export function deleteStoryApi(storyId: string): Promise<AxiosResponse<{ data: Record<string, never> }>> {
  return networkClient().request({
    method: HTTP_METHOD.DELETE,
    url: DELETE_STORY_URL.replace('{storyId}', storyId),
  })
}

/** Upload story image - reuses posts upload endpoint shape; stories have their own route */
export function uploadStoryImageApi(file: File): Promise<AxiosResponse<{ data: { url: string } }>> {
  const formData = new FormData()
  formData.append('image', file)
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: UPLOAD_STORY_IMAGE_URL,
    data: formData,
  })
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

/** Create story with optional image uploads (handles data URLs) */
export async function createStoryWithUploads(
  payload: CreateStoryPayload & { images: string[] }
): Promise<AxiosResponse<StoryResponse>> {
  const imageUrls: string[] = []
  const dataUrlCount = payload.images.filter((img) => img.startsWith('data:')).length

  for (let i = 0; i < payload.images.length; i++) {
    const img = payload.images[i]
    if (img.startsWith('data:')) {
      try {
        const file = dataUrlToFile(img, `story-${i}.jpg`)
        const uploadRes = await uploadStoryImageApi(file)
        const body = uploadRes?.data as Record<string, unknown> | undefined
        const url = (body?.data as Record<string, unknown>)?.url ?? body?.url
        if (url && typeof url === 'string') imageUrls.push(url)
      } catch (err: any) {
        const msg = err?.errorMessage ?? err?.message ?? 'Image upload failed'
        throw new Error(msg)
      }
    } else {
      imageUrls.push(img)
    }
  }

  if (dataUrlCount > 0 && imageUrls.length === 0) {
    throw new Error('Image upload failed. Please try again.')
  }

  return createStoryApi({
    title: payload.title,
    images: imageUrls,
  })
}
