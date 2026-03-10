import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginApi, signupApi, logoutApi } from '@/services/api/userService';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import networkClient from '@/services/api/networkClient';
import { AUTH_GOOGLE_URL, AUTH_APPLE_URL } from '@/services/api/endPoints';
import { resetStore } from '@/state/actions';
import { clearUserStorage } from '@/lib/logout';
import { setStoredToken, removeStoredToken, isCookieAuth } from '@/lib/security';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isElite?: boolean;
  gender?: 'ladies' | 'men' | 'all' | null;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  /** True once auth has been checked from storage; avoid redirect until then */
  authInitialized: boolean;
  login: (identity: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (profile: UserProfile, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    // Initialize auth: cookie mode = check /profile or similar; localStorage = token + user
    try {
      if (isCookieAuth()) {
        // Cookie auth: user state comes from a /me or /profile fetch, not storage
        setUser(null);
      } else {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Error initializing auth from storage', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setAuthInitialized(true);
    }
  }, []);

  const login = async (identity: string, password?: string) => {
    // identity is email or phone; backend expects email field in current userService,
    // pass as email for now (backend should accept identifier).
    try {
      const resp = await loginApi({
        email: identity,
        password: password || '',
        deviceFingerprint: getDeviceFingerprint(),
      });
      const data = resp.data as any;
      const token = data.data?.token ?? data.token;
      const userData = data.data?.user ?? data.user;

      if (token) localStorage.setItem('token', token);
      if (userData) localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData || null);
    } catch (error) {
      // rethrow for UI to handle
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    // Popup-based OAuth flow.
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) throw new Error('Google client id not configured (VITE_GOOGLE_CLIENT_ID)')

    const redirectUri = `${window.location.origin}/google-oauth-callback.html`
    const state = Math.random().toString(36).slice(2)
    const nonce = Math.random().toString(36).slice(2)

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    // request id_token and access_token in response hash so the callback can forward them
    authUrl.searchParams.set('response_type', 'token id_token')
    authUrl.searchParams.set('scope', 'openid profile email')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('nonce', nonce)
    authUrl.searchParams.set('prompt', 'select_account')

    const width = 500; const height = 700
    const left = window.screenX + (window.innerWidth - width) / 2
    const top = window.screenY + (window.innerHeight - height) / 2
    const popup = window.open(authUrl.toString(), 'google_oauth', `width=${width},height=${height},left=${left},top=${top}`)
    if (!popup) throw new Error('Failed to open authentication popup')

    // Await message from popup
    const waitForMessage = () => new Promise<Record<string, any>>((resolve, reject) => {
      const onMessage = (ev: MessageEvent) => {
        try {
          if (ev.origin !== window.location.origin) return
          const data = ev.data || {}
          if (data.type === 'google-auth') {
            window.removeEventListener('message', onMessage)
            resolve(data.payload || { error: data.error })
          }
        } catch (e) {
          window.removeEventListener('message', onMessage)
          reject(e)
        }
      }
      window.addEventListener('message', onMessage)
      // timeout
      const t = setTimeout(() => {
        window.removeEventListener('message', onMessage)
        reject(new Error('Authentication timed out'))
      }, 120000)
      // ensure popup closed handler
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval)
          clearTimeout(t)
          window.removeEventListener('message', onMessage)
          reject(new Error('Authentication cancelled'))
        }
      }, 500)
    })

    try {
      const payload = await waitForMessage()
      // payload should contain id_token or access_token
      const id_token = payload.id_token || payload.idToken || null
      const access_token = payload.access_token || payload.accessToken || null
      if (!id_token && !access_token) {
        throw new Error(payload.error || 'No token received')
      }

      // Exchange token with backend for application token + user
      const resp = await networkClient().request({ method: 'POST', url: AUTH_GOOGLE_URL, data: { id_token, access_token } })
      const data = resp.data as any
      const token = data.data?.token ?? data.token
      const userData = data.data?.user ?? data.user

      if (token) setStoredToken(token)
      if (userData) localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData || null)
    } finally {
      try { popup.close() } catch (e) {}
    }
  };

  const loginWithApple = async () => {
    const clientId = (import.meta as any).env?.VITE_APPLE_CLIENT_ID as string | undefined;
    const apiBase = ((import.meta as any).env?.VITE_APP_BASE_URL as string) || 'http://localhost:5000/api';
    const redirectUri = `${apiBase}/auth/apple/callback`;
    if (!clientId) throw new Error('Apple client id not configured (VITE_APPLE_CLIENT_ID)');

    // Load Apple Sign In JS
    await new Promise<void>((resolve, reject) => {
      if ((window as any).AppleID) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Apple Sign In'));
      document.head.appendChild(script);
    });

    const AppleID = (window as any).AppleID;
    const state = Math.random().toString(36).slice(2);
    const nonce = Math.random().toString(36).slice(2);

    AppleID.auth.init({
      clientId,
      scope: 'name email',
      redirectURI: redirectUri,
      state,
      nonce,
      usePopup: true,
    });

    const waitForMessage = () =>
      new Promise<{ token?: string; user?: any; error?: string }>((resolve, reject) => {
        const onMessage = (ev: MessageEvent) => {
          if (ev.origin !== window.location.origin) return;
          if (ev.data?.type === 'apple-auth') {
            window.removeEventListener('message', onMessage);
            if (ev.data.error) resolve({ error: ev.data.error });
            else resolve(ev.data.payload || {});
          }
        };
        window.addEventListener('message', onMessage);
        setTimeout(() => {
          window.removeEventListener('message', onMessage);
          reject(new Error('Apple authentication timed out'));
        }, 120000);
      });

    try {
      await AppleID.auth.signIn();
      const result = await waitForMessage();
      if (result.error) throw new Error(result.error);
      if (result.token) {
        setStoredToken(result.token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user || null);
      } else {
        throw new Error('No token received from Apple');
      }
    } catch (err) {
      throw err;
    }
  };

  const register = async (profile: UserProfile, password: string) => {
    try {
      const payload: any = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        password,
      };
      if (profile.email) payload.email = profile.email;
      if (profile.phone) payload.phone = profile.phone;
      if (profile.gender) payload.gender = profile.gender;

      const resp = await signupApi(payload as any);
      const data = resp.data as any;
      const token = data.data?.token ?? data.token;
      const userData = data.data?.user ?? data.user;

      if (token) setStoredToken(token);
      if (userData) localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData || null);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // 1. Invalidate server session (fire-and-forget, before clearing token)
    logoutApi().catch(() => {});

    // 2. Clear all user-specific data from localStorage
    clearUserStorage();

    // 3. Reset Redux state (profile, salon, feed, booking, etc.)
    dispatch(resetStore());

    // 4. Notify layout/other consumers to reset local state
    window.dispatchEvent(new CustomEvent('auth:session-expired'));

    // 5. Clear auth state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, authInitialized, login, loginWithGoogle, loginWithApple, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
