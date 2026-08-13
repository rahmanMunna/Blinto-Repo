import type { Metadata } from 'next';

import { AuthProvider } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Blinto — links, shortened',
    template: '%s · Blinto',
  },
  description:
    'Shorten long URLs into clean, trackable links and watch the clicks roll in.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>

          <footer className="mt-24 border-t border-white/5 py-8">
            <div className="mx-auto max-w-6xl px-5 text-sm text-mist-600">
              Blinto — a URL shortener built on Next.js and NestJS.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
