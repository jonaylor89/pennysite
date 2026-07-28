import { useEffect } from "react";
import { Link } from "react-router";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Page Not Found - Pennysite";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-ink-900">
      <h1 className="font-serif text-4xl tracking-[-0.02em]">404</h1>
      <p className="mt-2 text-ink-600">Page not found</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Back to home
      </Link>
    </div>
  );
}
