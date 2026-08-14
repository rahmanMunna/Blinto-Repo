import type { JwtPayload } from './types';

/**
 * The backend's AuthGuard reads the `Authorization: Bearer <token>` header only
 * (backend/src/auth/auth.guard.ts) — it never looks at the httpOnly cookies the
 * controller also sets. So the browser has to keep the token pair itself.
 */
const ACCESS_KEY = 'blinto.access_token';
const REFRESH_KEY = 'blinto.refresh_token';

export const tokenStore = {
  get access(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },

  get refresh(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },

  save(access: string, refresh: string) {
    window.localStorage.setItem(ACCESS_KEY, access);
    window.localStorage.setItem(REFRESH_KEY, refresh);
  },

  clear() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

/** Reads the JWT body without verifying it — display only, never for trust. */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 <= Date.now();
}
