import { tokenStore } from './tokens';
import type {
  LoginPayload,
  RegisterPayload,
  ShortUrl,
  TokenPair,
  User,
} from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Nest throws `{ statusCode, message, error }`; message is a string or string[]. */
async function toApiError(res: Response): Promise<ApiError> {
  let message = res.statusText || 'Request failed';

  try {
    const body = await res.json();
    if (Array.isArray(body?.message)) message = body.message.join(', ');
    else if (typeof body?.message === 'string') message = body.message;
  } catch {
    /* non-JSON error body — keep the status text */
  }

  return new ApiError(message, res.status);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** POST /url answers with a bare string, not JSON. */
  raw?: boolean;
}

/**
 * Only one refresh call may be in flight; every 401 that lands while it is
 * running waits on the same promise instead of burning the refresh token.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function runRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const tokens = (await res.json()) as TokenPair;
    tokenStore.save(tokens.access_token, tokens.refresh_token);

    return true;
  } catch {
    return false;
  }
}

function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = runRefresh().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};

/** Lets the auth provider bounce the user to /login when refreshing fails. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};

  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  if (options.auth) {
    const token = tokenStore.access;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options);

  // The access token lives ~5 minutes, so expiry mid-session is the norm.
  if (res.status === 401 && options.auth) {
    const refreshed = await refreshTokens();

    if (!refreshed) {
      tokenStore.clear();
      onSessionExpired();
      throw new ApiError('Your session expired. Please sign in again.', 401);
    }

    res = await send(path, options);
  }

  if (!res.ok) throw await toApiError(res);

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;

  if (options.raw) return text as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

/* ------------------------------------------------------------------ */
/* Auth — backend/src/auth/auth.controller.ts                          */
/* ------------------------------------------------------------------ */

export const authApi = {
  /** POST /auth/register → the created user (no tokens are issued here) */
  register: (payload: RegisterPayload) =>
    request<User>('/auth/register', { method: 'POST', body: payload }),

  /** POST /auth/login → { access_token, refresh_token } */
  login: (payload: LoginPayload) =>
    request<TokenPair>('/auth/login', { method: 'POST', body: payload }),

  /** POST /auth/refresh → a rotated { access_token, refresh_token } */
  refresh: (refreshToken: string) =>
    request<TokenPair>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),

  /** GET /auth/google — a full page navigation, Passport redirects to Google */
  googleUrl: () => `${API_URL}/auth/google`,
};

/* ------------------------------------------------------------------ */
/* URLs — backend/src/url/url.controller.ts (every route is guarded)   */
/* ------------------------------------------------------------------ */


export const urlApi = {
  /** POST /url → the short URL as a bare string */
  create: (originalUrl: string) =>
    request<string>('/url', {
      method: 'POST',
      body: { originalUrl },
      auth: true,
      raw: true,
    }),

  /** GET /url/user → the signed-in user's links */
  listMine: () => request<ShortUrl[]>('/url/user', { auth: true }),

  /**
   * GET /url → also the signed-in user's links. The backend scopes this to the
   * caller; no route exposes another account's links.
   */
  list: () => request<ShortUrl[]>('/url', { auth: true }),

  /** GET /url/:shortCode/details → the full record */
  details: (shortCode: string) =>
    request<ShortUrl>(`/url/${encodeURIComponent(shortCode)}/details`, {
      auth: true,
    }),

  /** GET /url/:shortCode/visits → { visits } */
  visits: (shortCode: string) =>
    request<{ visits: number }>(
      `/url/${encodeURIComponent(shortCode)}/visits`,
      { auth: true },
    ),

  /** PATCH /url/:shortCode → { short_code, new_original_url } */
  update: (shortCode: string, originalUrl: string) =>
    request<{ short_code: string; new_original_url: string }>(
      `/url/${encodeURIComponent(shortCode)}`,
      { method: 'PATCH', body: { originalUrl }, auth: true },
    ),

  /** DELETE /url/:shortCode → true */
  remove: (shortCode: string) =>
    request<boolean>(`/url/${encodeURIComponent(shortCode)}`, {
      method: 'DELETE',
      auth: true,
    }),

};

/** Turns a short_code into the shareable link the backend hands out. */
export function shortLink(shortCode: string): string {
  return `${API_URL}/url/${shortCode}`;
}
