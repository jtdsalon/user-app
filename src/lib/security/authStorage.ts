/**
 * Auth token storage abstraction.
 *
 * SECURITY: Prefer httpOnly cookies over localStorage (XSS-resistant).
 * When backend sets auth via Set-Cookie with HttpOnly, use cookie mode.
 * Set VITE_USE_COOKIE_AUTH=true when backend supports cookie-based auth.
 *
 * Backend cookie requirements (when using cookie auth):
 * - Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict; Path=/
 * - HttpOnly: prevents JavaScript access (XSS protection)
 * - Secure: only sent over HTTPS
 * - SameSite=Strict: CSRF protection
 */

const USE_COOKIE_AUTH =
  (import.meta as any).env?.VITE_USE_COOKIE_AUTH === 'true' ||
  (import.meta as any).env?.VITE_USE_COOKIE_AUTH === '1';

/** Token is in httpOnly cookie - frontend never reads it; browser sends automatically */
export const isCookieAuth = (): boolean => USE_COOKIE_AUTH;

/** Get token for Authorization header. Returns null when using cookie auth. */
export function getStoredToken(): string | null {
  if (USE_COOKIE_AUTH) return null;
  return localStorage.getItem('token');
}

/** Store token (localStorage fallback when backend returns token in body) */
export function setStoredToken(token: string | null): void {
  if (USE_COOKIE_AUTH) return;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

/** Remove stored token */
export function removeStoredToken(): void {
  if (USE_COOKIE_AUTH) return;
  localStorage.removeItem('token');
}
