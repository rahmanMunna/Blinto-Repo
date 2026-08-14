'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ChartIcon, ExternalIcon, LinkIcon } from '@/components/icons';
import { Protected } from '@/components/protected';
import { Alert, CopyButton, Spinner, Stat } from '@/components/ui';
import { ApiError, shortLink, urlApi } from '@/lib/api';
import type { ShortUrl } from '@/lib/types';

function Details({ shortCode }: { shortCode: string }) {
  const [url, setUrl] = useState<ShortUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  const load = useCallback(async () => {
    setError(null);

    try {
      // GET /url/:shortCode/details carries the whole record, visit count included.
      setUrl(await urlApi.details(shortCode));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not load this link.',
      );
    } finally {
      setLoading(false);
    }
  }, [shortCode]);

  useEffect(() => {
    void load();
  }, [load]);

  async function open() {
    setOpening(true);

    try {
      const destination = await urlApi.resolveAndOpen(shortCode);
      window.open(destination, '_blank', 'noopener,noreferrer');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not open it.');
    } finally {
      setOpening(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-mist-500">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Loading link…</span>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <Alert>{error ?? 'Link not found.'}</Alert>
        <Link href="/dashboard" className="btn btn-ghost mt-6">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const share = shortLink(url.short_code);
  const created = new Date(url.created_at);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link
        href="/dashboard"
        className="text-sm text-mist-500 transition-colors hover:text-mist-100"
      >
        ← Back to dashboard
      </Link>

      <header className="animate-rise mt-5">
        <h1 className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
          /{url.short_code}
        </h1>
        <p
          className="mt-2 truncate text-sm text-mist-500"
          title={url.original_url}
        >
          {url.original_url}
        </p>
      </header>

      <div className="mt-7 flex flex-wrap gap-2">
        <CopyButton value={share} label="Copy short link" />
        <button
          type="button"
          onClick={open}
          disabled={opening}
          className="btn btn-primary"
        >
          {opening ? <Spinner /> : <ExternalIcon className="h-4 w-4" />}
          Open destination
        </button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Visits"
          value={url.visit_count}
          icon={<ChartIcon className="h-4 w-4" />}
        />
        <Stat
          label="Short code"
          value={url.short_code}
          icon={<LinkIcon className="h-4 w-4" />}
        />
        <Stat
          label="Created"
          value={
            Number.isNaN(created.getTime())
              ? '—'
              : created.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
          }
        />
      </section>

      <section className="glass-card mt-6 rounded-2xl p-6">
        <h2 className="text-base font-semibold">Raw record</h2>
        <p className="mt-1 text-sm text-mist-500">
          Exactly what{' '}
          <code className="font-mono text-xs">
            GET /url/{url.short_code}/details
          </code>{' '}
          returned.
        </p>

        <dl className="mt-4 divide-y divide-ink-700 text-sm">
          {Object.entries(url).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-wrap justify-between gap-3 py-2.5"
            >
              <dt className="font-mono text-xs text-mist-600">{key}</dt>
              <dd className="max-w-full truncate font-mono text-xs text-mist-300">
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default function LinkDetailsPage() {
  const params = useParams<{ shortCode: string }>();

  return (
    <Protected>
      <Details shortCode={params.shortCode} />
    </Protected>
  );
}
