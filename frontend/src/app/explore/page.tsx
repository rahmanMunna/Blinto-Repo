'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { LinkCard } from '@/components/link-card';
import { Protected } from '@/components/protected';
import { Alert, EmptyState, SkeletonRow } from '@/components/ui';
import { ApiError, urlApi } from '@/lib/api';
import type { ShortUrl } from '@/lib/types';

/**
 * GET /url returns every link in the system, not just the caller's — the
 * backend applies no ownership filter on that route.
 */
function Explore() {
  const [links, setLinks] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setError(null);

    try {
      setLinks(await urlApi.listAll());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not load the links.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = needle
      ? links.filter(
          (link) =>
            link.short_code.toLowerCase().includes(needle) ||
            link.original_url.toLowerCase().includes(needle),
        )
      : links;

    return [...filtered].sort((a, b) => b.visit_count - a.visit_count);
  }, [links, query]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="animate-rise">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          All links
        </h1>
        <p className="mt-1.5 text-sm text-mist-500">
          Every short link on this server, busiest first.
        </p>
      </header>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by short code or destination…"
        className="field mt-6"
        aria-label="Search links"
      />

      <div className="mt-5 space-y-3">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : visible.length === 0 ? (
          <EmptyState
            title={query ? 'Nothing matched' : 'No links yet'}
            description={
              query
                ? 'Try a different short code or destination.'
                : 'Once anyone shortens a URL it will be listed here.'
            }
          />
        ) : (
          visible.map((link) => (
            <LinkCard
              key={link.id}
              url={link}
              manageable={false}
              onChanged={() => void load()}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Protected>
      <Explore />
    </Protected>
  );
}
