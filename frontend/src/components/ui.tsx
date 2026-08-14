'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CheckIcon, CopyIcon, LinkIcon, SpinnerIcon } from './icons';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-600/30 transition-transform group-hover:scale-105">
        <LinkIcon className="h-4.5 w-4.5 text-white" />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight">
          Blin<span className="text-brand-300">to</span>
        </span>
      )}
    </Link>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <SpinnerIcon className={className} />;
}

export function Alert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success' | 'info';
  children: React.ReactNode;
}) {
  const tones = {
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    info: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
  };

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-3.5 py-2.5 text-sm ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

/** Copies text and flips to a checkmark for a beat. */
export function CopyButton({
  value,
  label = 'Copy',
  className = '',
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard API needs a secure context; fall back to a selection prompt.
      window.prompt('Copy this link', value);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn btn-ghost ${className}`}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-emerald-300" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
      <span className={copied ? 'text-emerald-300' : ''}>
        {copied ? 'Copied' : label}
      </span>
    </button>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-ink-600 bg-ink-850">
        <LinkIcon className="h-5 w-5 text-mist-500" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-mist-500">{description}</p>
      {action}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="glass-card animate-pulse rounded-2xl p-5">
      <div className="h-4 w-40 rounded bg-ink-700" />
      <div className="mt-3 h-3 w-72 max-w-full rounded bg-ink-800" />
    </div>
  );
}

/** Small labelled figure used across the dashboard and details page. */
export function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-mist-500">
          {label}
        </span>
        {icon && <span className="text-brand-300">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
