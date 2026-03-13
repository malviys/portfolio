import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you were looking for doesn't exist.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[85vh] flex-col items-center justify-center text-center px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">404</p>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Page not found</h1>
      <p className="max-w-md text-muted-foreground mb-8">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        ← Back home
      </Link>
    </main>
  );
}
