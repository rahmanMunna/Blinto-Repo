'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ApiError, shortLink, urlApi } from '@/lib/api';
import type { ShortUrl } from '@/lib/types';
import {
  ChartIcon,
  EditIcon,
  ExternalIcon,
  TrashIcon,
} from './icons';
import { Alert, CopyButton, Spinner } from './ui';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface LinkCardProps {
  url: ShortUrl;
  /** Owner-only affordances are hidden on the shared "All links" view. */
  manageable?: boolean;
  onChanged?: () => void;
}

export function LinkCard({
  url,
  manageable = true,
  onChanged,
}: LinkCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(url.original_url);
  const [busy, setBusy] = useState<null | 'save' | 'delete' | 'open'>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const share = shortLink(url.short_code);

  function report(err: unknown) {
    setError(err instanceof ApiError ? err.message : 'Something went wrong.');
  }

  async function save() {
    setError(null);
    setBusy('save');

    try {
      await urlApi.update(url.short_code, draft.trim());
      setEditing(false);
      onChanged?.();
    } catch (err) {
      report(err);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setError(null);
    setBusy('delete');

    try {
      await urlApi.remove(url.short_code);
      onChanged?.();
    } catch (err) {
      report(err);
      setBusy(null);
    }
  }

  /** GET /url/:shortCode is guarded, so resolve through the API then navigate. */
  async function open() {
    setError(null);
    setBusy('open');

    try {
      const destination = await urlApi.resolveAndOpen(url.short_code);
      window.open(destination, '_blank', 'noopener,noreferrer');
      onChanged?.();
    } catch (err) {
      report(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="glass-card group rounded-2xl p-5 transition-colors hover:border-white/12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/links/${url.short_code}`}
              className="font-mono text-sm font-semibold text-brand-300 hover:text-brand-400"
            >
              /{url.short_code}
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-ink-600 bg-ink-850 px-2 py-0.5 text-xs text-mist-500">
              <ChartIcon className="h-3 w-3" />
              {url.visit_count}
            </span>
          </div>

          {editing ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="field"
                aria-label="New destination URL"
                disabled={busy === 'save'}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy === 'save' || !draft.trim()}
                  className="btn btn-primary"
                >
                  {busy === 'save' && <Spinner />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(url.original_url);
                    setEditing(false);
                    setError(null);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="mt-1.5 truncate text-sm text-mist-500"
              title={url.original_url}
            >
              {url.original_url}
            </p>
          )}

          <p className="mt-2 text-xs text-mist-600">
            Created {formatDate(url.created_at)}
          </p>
        </div>

        {!editing && (
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={share} className="!px-2.5 !py-2" label="Copy" />

            <button
              type="button"
              onClick={open}
              disabled={busy === 'open'}
              className="btn btn-ghost !px-2.5 !py-2"
              title="Open destination"
              aria-label="Open destination"
            >
              {busy === 'open' ? (
                <Spinner />
              ) : (
                <ExternalIcon className="h-4 w-4" />
              )}
            </button>

            {manageable && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn btn-ghost !px-2.5 !py-2"
                  title="Edit destination"
                  aria-label="Edit destination"
                >
                  <EditIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    confirmDelete ? remove() : setConfirmDelete(true)
                  }
                  onBlur={() => setConfirmDelete(false)}
                  disabled={busy === 'delete'}
                  className="btn btn-danger !px-2.5 !py-2"
                  title={confirmDelete ? 'Click again to confirm' : 'Delete link'}
                  aria-label={
                    confirmDelete ? 'Confirm delete' : 'Delete link'
                  }
                >
                  {busy === 'delete' ? (
                    <Spinner />
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                  {confirmDelete && <span className="text-xs">Sure?</span>}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      )}
    </article>
  );
}
