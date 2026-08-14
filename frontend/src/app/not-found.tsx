import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="font-mono text-sm text-brand-300">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        This page went missing
      </h1>
      <p className="max-w-sm text-sm text-mist-500">
        The page you were after does not exist. Short links live under{' '}
        <code className="font-mono text-xs">/links/&lt;code&gt;</code>.
      </p>
      <Link href="/" className="btn btn-primary mt-2">
        Back home
      </Link>
    </div>
  );
}
