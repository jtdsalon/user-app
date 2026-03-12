/**
 * Single source of truth for API base URL and related config.
 * Only this file reads VITE_APP_* env vars. All app code should import from here.
 *
 * Set VITE_APP_BASE_URL in one place per environment:
 *   - Local: .env or .env.local (gitignored)
 *   - CI/CD: inject at build time
 *   - Or use .env.development / .env.qa / .env.production per Vite mode
 *
 * --- How to call server API & image URL ---
 *
 * 1) Server API (fetch / axios):
 *    import { baseApiUrl } from '@/config/api'
 *    const url = `${baseApiUrl}/users/profile`   // e.g. http://localhost:3000/api/users/profile
 *    fetch(url, { ... })
 *    (The app's networkClient in services/api already uses baseApiUrl as baseURL.)
 *
 * 2) Image URL (avatars, feed images, uploads):
 *    import { getFullImageUrl } from '@/lib/util/imageUrl'
 *    <Avatar src={getFullImageUrl(user.avatar)} />
 *    <img src={getFullImageUrl(post.image)} />
 *    getFullImageUrl() accepts a path (e.g. /uploads/posts/.../file.jpg) or full URL;
 *    it returns the full URL using the server origin from VITE_APP_BASE_URL.
 */

type ViteEnv = { VITE_APP_BASE_URL?: string; VITE_APP_API_KEY?: string; VITE_CSP_IMG_SRC?: string; MODE?: string }
const meta = import.meta as unknown as { env?: ViteEnv }
const env: ViteEnv = meta.env ?? {}

/** Allowed protocols for API base URL (security: no file:// or javascript:) */
const ALLOWED_PROTOCOLS = ['http:', 'https:']

function validateAndNormalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? '').trim()
  if (!value) return ''
  // Relative path (e.g. /api for same-origin) — only normalize trailing slash
  if (!value.includes('://')) {
    const path = value.startsWith('/') ? value : `/${value}`
    return path.replace(/\/+$/, '') || '/api'
  }
  try {
    const url = new URL(value)
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      console.warn('[config/api] Invalid protocol for VITE_APP_BASE_URL:', url.protocol)
      return ''
    }
    url.pathname = url.pathname.replace(/\/+$/, '') || '/api'
    return url.toString().replace(/\/+$/, '')
  } catch {
    console.warn('[config/api] Invalid VITE_APP_BASE_URL:', value)
    return ''
  }
}

/** Read env once and build config. Set VITE_APP_BASE_URL in .env (restart dev server after changing). */
function createApiConfig() {
  const rawBase = env.VITE_APP_BASE_URL as string | undefined
  let baseApiUrl = validateAndNormalizeBaseUrl(rawBase)
  const apiKey = (env.VITE_APP_API_KEY as string | undefined)?.trim() ?? ''
  const appMode = (env.MODE as string) ?? 'development'
  // Fallback when VITE_APP_BASE_URL is missing
  if (!baseApiUrl) {
    if (appMode === 'development') {
      baseApiUrl = validateAndNormalizeBaseUrl('http://localhost:3000/api') || ''
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          '[config/api] VITE_APP_BASE_URL is not set. Using fallback for development. Set VITE_APP_BASE_URL in .env or .env.development and restart the dev server.'
        )
      }
    } else if (appMode === 'qa' || appMode === 'production') {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      baseApiUrl = origin ? `${origin.replace(/\/$/, '')}/api` : ''
    }
  }
  // If app is served from QA/prod host but build had localhost, use current origin so API calls hit the same host
  if (typeof window !== 'undefined' && baseApiUrl && (baseApiUrl.includes('localhost') || baseApiUrl.includes('127.0.0.1'))) {
    const origin = window.location.origin
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      baseApiUrl = `${origin.replace(/\/$/, '')}/api`
    }
  }

  const getServerOrigin = (): string => {
    if (!baseApiUrl) return typeof window !== 'undefined' ? window.location.origin : ''
    if (!baseApiUrl.includes('://')) return typeof window !== 'undefined' ? window.location.origin : ''
    return baseApiUrl.replace(/\/api\s*$/, '')
  }

  const cspImgSrcRaw = (env.VITE_CSP_IMG_SRC as string | undefined)?.trim()
  /** CSP img-src: from VITE_CSP_IMG_SRC or derived from API origin (localhost + 127.0.0.1 in dev). */
  const getCspImgSrc = (): string => {
    if (cspImgSrcRaw) return cspImgSrcRaw
    const origin = getServerOrigin()
    if (!origin) return ''
    try {
      const url = new URL(origin)
      if (url.hostname === 'localhost') {
        return `${origin} http://127.0.0.1:${url.port || (url.protocol === 'https:' ? '443' : '80')}`
      }
      return origin
    } catch {
      return origin
    }
  }

  return {
    baseApiUrl,
    apiKey,
    appMode,
    isDev: appMode === 'development',
    isQa: appMode === 'qa',
    isProd: appMode === 'production',
    getServerOrigin,
    getCspImgSrc,
  } as const
}

const apiConfig = Object.freeze(createApiConfig())

export const baseApiUrl = apiConfig.baseApiUrl
export const apiKey = apiConfig.apiKey
export const getServerOrigin = apiConfig.getServerOrigin
export const getCspImgSrc = apiConfig.getCspImgSrc
export const appMode = apiConfig.appMode
export { apiConfig }
export default apiConfig

/** Build full CSP content string; img-src from getCspImgSrc() (env only). Call from main.tsx to set meta tag. */
export function getCspContent(): string {
  const imgSources = getCspImgSrc()
  const imgSrc = `'self' data: https: blob:${imgSources ? ` ${imgSources}` : ''}`
  return `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src ${imgSrc}; connect-src 'self' https: http://localhost:* ws://localhost:* wss://localhost:*; frame-ancestors 'self'; base-uri 'self'; form-action 'self'`
}
