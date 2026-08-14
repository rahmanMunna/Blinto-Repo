'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useAuth } from '@/components/auth-provider';
import { GoogleButton } from '@/components/google-button';
import { Alert, Brand, Spinner } from '@/components/ui';
import { ApiError } from '@/lib/api';

/** Mirrors RegisterGuestDto: @MinLength(8) on password, both must match. */
const MIN_PASSWORD_LENGTH = 8;

function RegisterForm() {
  const { register, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const pendingUrl = params.get('url');
  const nextPath = pendingUrl
    ? `/dashboard?url=${encodeURIComponent(pendingUrl)}`
    : '/dashboard';

  useEffect(() => {
    if (user) router.replace(nextPath);
  }, [user, router, nextPath]);

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    // Check locally first so the mismatch never costs a round trip.
    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setPending(true);

    try {
      await register(form);
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-mist-500">
            Takes about twenty seconds.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            value={form.username}
            onChange={update('username')}
            required
            maxLength={50}
            autoComplete="username"
            placeholder="munna"
            disabled={pending}
            className="field"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            autoComplete="email"
            placeholder="munna@example.com"
            disabled={pending}
            className="field"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update('password')}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={pending}
              className="field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={pending}
              className="field"
            />
          </div>
        </div>

        <p className="text-xs text-mist-600">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>

        {error && <Alert>{error}</Alert>}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full"
        >
          {pending && <Spinner />}
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-mist-600">
        <span className="h-px flex-1 bg-ink-700" />
        or
        <span className="h-px flex-1 bg-ink-700" />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="mt-7 text-center text-sm text-mist-500">
        Already have an account?{' '}
        <Link
          href={pendingUrl ? `/login?url=${encodeURIComponent(pendingUrl)}` : '/login'}
          className="font-medium text-brand-300 hover:text-brand-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
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
        <RegisterForm />
      </Suspense>
    </div>
  );
}
