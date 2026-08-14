'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from './auth-provider';
import { Spinner } from './ui';

/** Client-side gate: every /url route on the backend sits behind the AuthGuard. */
export function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-mist-500">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Checking your session…</span>
      </div>
    );
  }

  return <>{children}</>;
}
