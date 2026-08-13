'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useAuth } from '@/components/auth-provider';
import { GoogleButton } from '@/components/google-button';
import { Alert, Brand, Spinner } from '@/components/ui';
import { ApiError } from '@/lib/api';

function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Landing page passes ?url=… so the link survives the detour through sign-in.
  const pendingUrl = params.get('url');
  const nextPath = pendingUrl
    ? `/dashboard?url=${encodeURIComponent(pendingUrl)}`
    : '/dashboard';

  useEffect(() => {
    if (user) router.replace(nextPath);
  }, [user, router, nextPath]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      await login({ username, password });
      router.replace(nextPath);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not reach the server. Is the backend running on port 3000?',
      );
      setPending(false);
    }
  }

  return (
    <div className="glass-card animate-rise w-full max-w-md rounded-3xl p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Brand />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-mist-500">
            Sign in to reach your links.
          </p>
        </div>
      </div>

      {params.get('expired') && (
        <div className="mt-6">
          <Alert tone="info">
            Your session timed out. Sign in again to continue.
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
            placeholder="munna"
            disabled={pending}
            className="field"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={pending}
            className="field"
          />
        </div>

        {error && <Alert>{error}</Alert>}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full"
        >
          {pending && <Spinner />}
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-mist-600">
        <span className="h-px flex-1 bg-ink-700" />
        or
        <span className="h-px flex-1 bg-ink-700" />
      </div>

      <GoogleButton label="Sign in with Google" />

      <p className="mt-7 text-center text-sm text-mist-500">
        New here?{' '}
        <Link
          href={pendingUrl ? `/register?url=${encodeURIComponent(pendingUrl)}` : '/register'}
          className="font-medium text-brand-300 hover:text-brand-400"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-14">
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-mist-500">
            <Spinner className="h-5 w-5" />
            <span className="text-sm">Loading…</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
