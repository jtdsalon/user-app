/**
 * Frontend security utilities and configuration.
 *
 * - authStorage: Token storage abstraction (supports cookie-based auth)
 * - XSS: React escapes by default; avoid dangerouslySetInnerHTML with unsanitized input
 */

export {
  isCookieAuth,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from './authStorage';
