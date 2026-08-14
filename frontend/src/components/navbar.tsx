'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from './auth-provider';
import { LogoutIcon } from './icons';
import { Brand } from './ui';

const links = [
  { href: '/dashboard', label: 'My links' },
  { href: '/explore', label: 'Top links' },
];

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  // A token is not guaranteed to carry a username, so never index into it blind.
  const displayName = user?.username?.trim() || 'Account';

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-8">
          <Brand />

          {user && (
            <div className="hidden items-center gap-1 sm:flex">
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'bg-white/8 text-mist-100'
                        : 'text-mist-500 hover:text-mist-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded-lg bg-ink-800" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-45 truncate text-sm font-medium">
                {displayName}
              </p>
              <p className="text-xs capitalize text-mist-600">
                {user.role ?? 'guest'}
              </p>
            </div>

            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-semibold uppercase text-white">
              {displayName.charAt(0)}
            </span>

            <button
              type="button"
              onClick={logout}
              className="btn btn-ghost !px-2.5 !py-2"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
