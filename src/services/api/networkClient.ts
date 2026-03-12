import axios, { AxiosInstance } from 'axios'
import { baseApiUrl, apiKey as envApiKey } from '@/config/api'
import * as properties from '../../lib/properties/properties'
import * as constants from '../../lib/constants'
import { HTTP_CODE } from '../../lib/enums/httpData'
import store from '../../state/store'
import { resetStore } from '../../state/actions'
import { clearUserStorage } from '../../lib/logout'
import { getStoredToken, isCookieAuth } from '../../lib/security'
import { ROUTES, BASE_PATH } from '../../routes/routeConfig'
import { GET_PROFILE_URL, REFRESH_TOKEN_URL } from './endPoints'

interface ErrorResponse {
  statusCode: number
  errorMessage: string
  externalErrorMessage?: string
}

function logoutToLogin(): void {
  clearUserStorage()
  store.dispatch(resetStore())
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
  if (typeof window !== 'undefined') {
    const loginPath = BASE_PATH + (ROUTES.LOGIN.startsWith('/') ? ROUTES.LOGIN : '/' + ROUTES.LOGIN)
    if (window.location.pathname !== loginPath) {
      window.location.href = loginPath
    }
  }
}

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (err: any) => void }> = []

const processQueue = (err: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (err) prom.reject(err)
    else prom.resolve(token)
  })
  failedQueue = []
  isRefreshing = false
}

/* Function to create and configure an axios instance for network requests (same pattern as salon-app) */
const networkClient = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: baseApiUrl,
    withCredentials: isCookieAuth(), // Send cookies (httpOnly auth) when enabled
  })

  /* Request interceptor to add headers and modify config before making a request */
  axiosInstance.interceptors.request.use(
    async (config) => {
      /* For FormData, let browser set Content-Type with boundary – do not override */
      if (config.data instanceof FormData) {
        delete (config.headers as Record<string, unknown>)['Content-Type']
      }

      /* Retrieve access token (null when using httpOnly cookie auth) */
      const accessToken = getStoredToken()
      if (accessToken) {
        config.headers[constants.HEADER_KEY_AUTHORIZATION] = `Bearer ${accessToken}`
      }

      /* Add other required headers */
      if (constants.HEADER_KEY_API_KEY) {
        config.headers[constants.HEADER_KEY_API_KEY] = envApiKey
      }
      if (constants.HEADER_KEY_ACCEPT) {
        config.headers[constants.HEADER_KEY_ACCEPT] = constants.HEADER_VAL_ACCEPT
      }
      if (constants.HEADER_KEY_PLATFORM) {
        config.headers[constants.HEADER_KEY_PLATFORM] = constants.HEADER_VAL_PLATFORM
      }
      if (constants.HEADER_APP_VERSION) {
        config.headers[constants.HEADER_APP_VERSION] = constants.HEADER_APP_VERSION_VAL
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  /* Response interceptor: token refresh on 401 (same as salon-app) when using token auth; then generic error handling */
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const isAuthRequest =
        originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register')

      /* 401 with token auth: try refresh then retry (skip for login/register and when using cookie auth) */
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthRequest &&
        !isCookieAuth()
      ) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          logoutToLogin()
          return Promise.reject(error)
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                if (token) originalRequest.headers[constants.HEADER_KEY_AUTHORIZATION] = `Bearer ${token}`
                resolve(axiosInstance(originalRequest))
              },
              reject,
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshClient = axios.create({ baseURL: baseApiUrl })
          const response = await refreshClient.post(REFRESH_TOKEN_URL, { refreshToken })
          const data = response.data
          const newToken = data?.data?.token ?? data?.token
          const newRefreshToken = data?.data?.refreshToken ?? data?.refreshToken

          if (newToken && newRefreshToken) {
            localStorage.setItem('token', newToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            originalRequest.headers[constants.HEADER_KEY_AUTHORIZATION] = `Bearer ${newToken}`
            processQueue(null, newToken)
            return axiosInstance(originalRequest)
          }
          throw new Error('Invalid token response')
        } catch (refreshError) {
          processQueue(refreshError, null)
          logoutToLogin()
          return Promise.reject(refreshError)
        }
      }

      const resp = error.response

      /* Derive status code */
      const status = resp?.status || HTTP_CODE.INTERNAL_SERVER_ERROR
      const code = resp?.data?.code ? String(resp.data.code) : ''
      const message = (resp?.data?.message || resp?.data?.error || '') as string
      const requestPath = String(resp?.config?.url || error.config?.url || '').split('?')[0]

      const isAuthRelated403 =
        status === HTTP_CODE.FORBIDDEN &&
        (/session|token|unauthorized|forbidden|invalid user|access denied/i.test(message) ||
          /TOKEN_EXPIRED|INVALID_SESSION|SESSION_TIMEOUT|INVALID_USER/i.test(code))

      const isMissingCurrentUserProfile =
        code === 'USER_NOT_FOUND' && requestPath === GET_PROFILE_URL

      if (status === HTTP_CODE.UNAUTHORIZED || isAuthRelated403 || isMissingCurrentUserProfile) {
        logoutToLogin()
        return Promise.reject(error)
      }

      const bodyMessage =
        resp?.data?.message ||
        resp?.data?.error ||
        (Array.isArray(resp?.data?.errors) && resp.data.errors[0]?.message)

      const icError: ErrorResponse = {
        statusCode: status,
        errorMessage: bodyMessage || properties.ERROR_POPUP_MESSAGE || 'An error occurred',
        externalErrorMessage: resp?.data?.code ? String(resp.data.code) : undefined,
      }
      return Promise.reject(icError)
    }
  )

  return axiosInstance
}

export default networkClient
