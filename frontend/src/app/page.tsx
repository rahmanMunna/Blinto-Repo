'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/components/auth-provider';
import { BoltIcon, ChartIcon, GlobeIcon, ShieldIcon } from '@/components/icons';

const features = [
  {
    icon: BoltIcon,
    title: 'Ten characters, one click',
    body: 'Every long URL collapses into a nanoid short code that is unique, unguessable, and ready to share.',
  },
  {
    icon: ChartIcon,
    title: 'Counted on every visit',
    body: 'Each redirect bumps the visit counter, so you always know which links are actually pulling weight.',
  },
  {
    icon: ShieldIcon,
    title: 'Two ways in',
    body: 'Sign in with a username and password, or hand it to Google. Either way you land in the same workspace.',
  },
  {
    icon: GlobeIcon,
    title: 'Edit without reprinting',
    body: 'Point an existing short code at a new destination whenever plans change. The link never breaks.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [draft, setDraft] = useState('');

  /** Anonymous visitors cannot call POST /url, so carry the intent to sign-in. */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const target = user ? '/dashboard' : '/login';
    const query = draft.trim()
      ? `?url=${encodeURIComponent(draft.trim())}`
      : '';

    router.push(`${target}${query}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="animate-rise py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-300">
          <BoltIcon className="h-3.5 w-3.5" />
          Short links with a memory
        </span>

        <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Long URLs go in.
          <br />
          <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent">
            Clean links come out.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mist-500">
          Blinto turns unwieldy links into short codes you can paste anywhere,
          then keeps count of every visit they earn.
        </p>

        <form
          onSubmit={handleSubmit}
          className="glass-card mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl p-2 sm:flex-row"
        >
          <input
            type="url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://example.com/a/very/long/path"
            className="field !border-transparent !bg-transparent focus:!shadow-none"
            aria-label="URL to shorten"
          />
          <button type="submit" className="btn btn-primary sm:px-6">
            Shorten it
          </button>
        </form>

        <p className="mt-4 text-xs text-mist-600">
          {user
            ? 'You are signed in — this drops you straight into your dashboard.'
            : 'Free to start. Sign in to keep your links.'}
        </p>
      </section>

      <section className="grid gap-4 pb-8 sm:grid-cols-2">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="glass-card animate-rise rounded-2xl p-6"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
              <feature.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist-500">
              {feature.body}
            </p>
          </article>
        ))}
      </section>

      {!user && (
        <section className="glass-card my-16 flex flex-col items-center gap-5 rounded-3xl px-6 py-14 text-center">
          <h2 className="max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to shorten your first link?
          </h2>
          <p className="max-w-md text-sm text-mist-500">
            Create an account with a password, or skip straight through with
            Google.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn btn-primary px-6">
              Create an account
            </Link>
            <Link href="/login" className="btn btn-ghost px-6">
              I already have one
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
