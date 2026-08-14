'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/auth-provider';
import { BoltIcon, ChartIcon, LinkIcon } from '@/components/icons';
import { LinkCard } from '@/components/link-card';
import { Protected } from '@/components/protected';
import {
  Alert,
  CopyButton,
  EmptyState,
  SkeletonRow,
  Spinner,
  Stat,
} from '@/components/ui';
import { ApiError, urlApi } from '@/lib/api';
import type { ShortUrl } from '@/lib/types';

function Dashboard() {
  const { user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();

  const [links, setLinks] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [draft, setDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);

    try {
      const mine = await urlApi.listMine();
      // Newest first — the API returns insertion order.
      setLinks(
        [...mine].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      setListError(
        err instanceof ApiError ? err.message : 'Could not load your links.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // A URL typed on the landing page rides along as ?url=… — prefill it once.
  useEffect(() => {
    const carried = params.get('url');
    if (!carried) return;

    setDraft(carried);
    router.replace('/dashboard');
  }, [params, router]);

  const stats = useMemo(() => {
    const visits = links.reduce((sum, link) => sum + link.visit_count, 0);
    const best = links.reduce<ShortUrl | null>(
      (top, link) => (!top || link.visit_count > top.visit_count ? link : top),
      null,
    );

    return { total: links.length, visits, best };
  }, [links]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setCreateError(null);
    setJustCreated(null);
    setCreating(true);

    try {
      // POST /url answers with the short URL as a plain string.
      const created = await urlApi.create(draft.trim());
      setJustCreated(created.trim());
      setDraft('');
      await load();
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? err.message
          : 'Could not create the short link.',
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="animate-rise">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hey {user?.username} 👋
        </h1>
        <p className="mt-1.5 text-sm text-mist-500">
          Shorten a new link or manage the ones you already have.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Links"
          value={stats.total}
          icon={<LinkIcon className="h-4 w-4" />}
        />
        <Stat
          label="Total visits"
          value={stats.visits}
          icon={<ChartIcon className="h-4 w-4" />}
        />
        <Stat
          label="Top link"
          value={stats.best ? `/${stats.best.short_code}` : '—'}
          icon={<BoltIcon className="h-4 w-4" />}
        />
      </section>

      <section className="glass-card mt-6 rounded-2xl p-6">
        <h2 className="text-base font-semibold">Shorten a URL</h2>
        <p className="mt-1 text-sm text-mist-500">
          Paste any link — it needs the scheme, like{' '}
          <code className="font-mono text-xs text-mist-300">https://</code>.
        </p>

        <form onSubmit={create} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            required
            disabled={creating}
            placeholder="https://example.com/a/very/long/path"
            className="field"
            aria-label="URL to shorten"
          />
          <button
            type="submit"
            disabled={creating || !draft.trim()}
            className="btn btn-primary sm:px-6"
          >
            {creating && <Spinner />}
            {creating ? 'Shortening…' : 'Shorten'}
          </button>
        </form>

        {createError && (
          <div className="mt-4">
            <Alert>{createError}</Alert>
          </div>
        )}

        {justCreated && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-300">
                Ready to share
              </p>
              <p className="mt-0.5 truncate font-mono text-sm">{justCreated}</p>
            </div>
            <CopyButton value={justCreated} label="Copy link" />
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Your links</h2>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm text-mist-500 transition-colors hover:text-mist-100"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : listError ? (
            <Alert>{listError}</Alert>
          ) : links.length === 0 ? (
            <EmptyState
              title="No links yet"
              description="Shorten your first URL with the box above and it will show up right here."
            />
          ) : (
            links.map((link) => (
              <LinkCard
                key={link.id}
                url={link}
                onChanged={() => void load()}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Protected>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </Protected>
  );
}
