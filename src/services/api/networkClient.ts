import axios, { AxiosInstance } from 'axios'
import * as properties from '../../lib/properties/properties'
import * as constants from '../../lib/constants'
import { HTTP_CODE } from '../../lib/enums/httpData'
import store from '../../state/store'
import { resetStore } from '../../state/actions'
import { clearUserStorage } from '../../lib/logout'
import { getStoredToken, isCookieAuth } from '../../lib/security'
import { ROUTES } from '../../routes/routeConfig'
import { GET_PROFILE_URL } from './endPoints'

interface ErrorResponse {
  statusCode: number
  errorMessage: string
  externalErrorMessage?: string
}

function logoutToLogin(): void {
  clearUserStorage()
  store.dispatch(resetStore())
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
  if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN
  }
}

/* Function to create and configure an axios instance for network requests */
const networkClient = (): AxiosInstance => {
  const baseURL = ((import.meta as any).env?.VITE_APP_BASE_URL as string | undefined) || 'http://localhost:5000/api'
  
  const axiosInstance = axios.create({
    baseURL,
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
        config.headers[constants.HEADER_KEY_API_KEY] = ((import.meta as any).env?.VITE_APP_API_KEY as string | undefined) || ''
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

  /* Response interceptor to handle error responses */
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const resp = error.response;

      /* Derive status code */
      const status = resp?.status || HTTP_CODE.INTERNAL_SERVER_ERROR;
      const code = resp?.data?.code ? String(resp.data.code) : '';
      const message = (resp?.data?.message || resp?.data?.error || '') as string;
      const requestPath = String(resp?.config?.url || error.config?.url || '').split('?')[0];

      const isAuthRelated403 =
        status === HTTP_CODE.FORBIDDEN &&
        (/session|token|unauthorized|forbidden|invalid user|access denied/i.test(message) ||
          /TOKEN_EXPIRED|INVALID_SESSION|SESSION_TIMEOUT|INVALID_USER/i.test(code));

      // Current-user profile returning USER_NOT_FOUND means the stored session points to
      // a user that no longer exists, so force a logout and send the user to login.
      const isMissingCurrentUserProfile =
        code === 'USER_NOT_FOUND' && requestPath === GET_PROFILE_URL;

      /* Auth/session failures should always clear local auth state and redirect to login. */
      if (status === HTTP_CODE.UNAUTHORIZED || isAuthRelated403 || isMissingCurrentUserProfile) {
        logoutToLogin()
        return Promise.reject(error)
      }

      /* Prefer structured body message from backend, then fallback message */
      const bodyMessage = resp?.data?.message || resp?.data?.error || (Array.isArray(resp?.data?.errors) && resp.data.errors[0]?.message);

      const icError: ErrorResponse = {
        statusCode: status,
        errorMessage:
          bodyMessage ||
          properties.ERROR_POPUP_MESSAGE ||
          'An error occurred',
        // Use backend 'code' field when provided as a machine-readable error identifier
        externalErrorMessage: resp?.data?.code ? String(resp.data.code) : undefined,
      };
      return Promise.reject(icError);
    }
  )

  return axiosInstance
}

export default networkClient
