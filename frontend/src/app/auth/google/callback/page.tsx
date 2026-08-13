'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/auth-provider';
import { Alert, Brand, Spinner } from '@/components/ui';

/**
 * Landing strip for the Google flow. The backend finishes the OAuth handshake
 * and redirects here with the token pair on the query string; we stash the
 * tokens, scrub them out of the URL, and move on to the dashboard.
 */
function GoogleCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const { adoptTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const failure = params.get('error');
    if (failure) {
      setError(decodeURIComponent(failure));
      return;
    }

    const access = params.get('access_token');
    const refresh = params.get('refresh_token');

    if (!access || !refresh) {
      setError(
        'Google did not return a session. Please try signing in again.',
      );
      return;
    }

    adoptTokens(access, refresh);

    // replace() keeps the tokens out of the browser history entry.
    router.replace('/dashboard');
  }, [params, adoptTokens, router]);

  if (error) {
    return (
      <div className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
        <div className="flex justify-center">
          <Brand />
        </div>

        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>

        <Link href="/login" className="btn btn-primary mt-6 w-full">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Brand />
      <div className="flex items-center gap-3 text-mist-500">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Finishing Google sign-in…</span>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
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
        <GoogleCallback />
      </Suspense>
    </div>
  );
}
