'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { authApi, setSessionExpiredHandler } from '@/lib/api';
import { decodeToken, isExpired, tokenStore } from '@/lib/tokens';
import type { JwtPayload, LoginPayload, RegisterPayload } from '@/lib/types';

interface AuthState {
  user: JwtPayload | null;
  /** True until the stored token has been read on the client. */
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  /** Called by the Google callback page once tokens arrive in the URL. */
  adoptTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const applyToken = useCallback((accessToken: string) => {
    setUser(decodeToken(accessToken));
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  // Rehydrate from localStorage on first client render.
  useEffect(() => {
    const access = tokenStore.access;
    const refresh = tokenStore.refresh;

    if (!access || !refresh) {
      setLoading(false);
      return;
    }

    // A 5-minute access token is usually stale on return; the refresh token
    // (10 minutes for password logins, 7 days for Google) may still be good.
    if (!isExpired(access)) {
      applyToken(access);
      setLoading(false);
      return;
    }

    authApi
      .refresh(refresh)
      .then((tokens) => {
        tokenStore.save(tokens.access_token, tokens.refresh_token);
        applyToken(tokens.access_token);
      })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, [applyToken]);

  // Let the API client sign the user out when a refresh finally fails.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      router.push('/login?expired=1');
    });

    return () => setSessionExpiredHandler(() => {});
  }, [router]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const tokens = await authApi.login(payload);
      tokenStore.save(tokens.access_token, tokens.refresh_token);
      applyToken(tokens.access_token);
    },
    [applyToken],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      // POST /auth/register issues no tokens, so sign in right after.
      await authApi.register(payload);
      await login({
        username: payload.username,
        password: payload.password,
      });
    },
    [login],
  );

  const adoptTokens = useCallback(
    (access: string, refresh: string) => {
      tokenStore.save(access, refresh);
      applyToken(access);
    },
    [applyToken],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, adoptTokens, logout }),
    [user, loading, login, register, adoptTokens, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');

  return ctx;
}
