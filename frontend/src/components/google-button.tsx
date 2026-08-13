'use client';

import { useState } from 'react';

import { authApi } from '@/lib/api';
import { GoogleIcon, SpinnerIcon } from './icons';

/**
 * Flow two: a full page navigation to GET /auth/google. Passport bounces the
 * browser to Google, Google returns to GET /auth/google/callback on the
 * backend, and the backend redirects back to /auth/google/callback here with
 * the freshly minted token pair.
 */
export function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  const [pending, setPending] = useState(false);

  function start() {
    setPending(true);
    window.location.href = authApi.googleUrl();
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={pending}
      className="btn btn-ghost w-full"
    >
      {pending ? (
        <SpinnerIcon className="h-4 w-4" />
      ) : (
        <GoogleIcon className="h-4 w-4" />
      )}
      {pending ? 'Redirecting to Google…' : label}
    </button>
  );
}
