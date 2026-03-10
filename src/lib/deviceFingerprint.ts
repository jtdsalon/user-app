/**
 * Generate a simple device fingerprint for login audit.
 * Uses non-PII browser characteristics (user agent, screen, timezone).
 * Does not track users across sites; used only for session audit.
 */
export function getDeviceFingerprint(): string | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;
  try {
    const parts = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency ?? 0,
    ].filter(Boolean);
    const str = parts.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash;
    }
    return `fp_${Math.abs(hash).toString(36)}`;
  } catch {
    return null;
  }
}
