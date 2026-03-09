import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-4">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight text-ink-900"
            >
              Pennysite
            </Link>
            <p className="max-w-xs text-sm text-ink-600">
              The AI website builder for people tired of all the subscriptions.
              Pay once, host free forever.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Product
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-600">
              <li>
                <Link
                  href="/project/new"
                  className="hover:text-ink-900 transition-colors"
                >
                  Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-ink-900 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-ink-900 transition-colors"
                >
                  What is Pennysite
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Connect
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-600">
              <li>
                <a
                  href="https://x.com/jonaylor89"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition-colors"
                >
                  X (Twitter)
                </a>
              </li>

              <li>
                <a
                  href="mailto:me@jonaylor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition-colors"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://www.jonaylor.com/blog/i-built-a-website-builder-that-costs-pennies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} Pennysite. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-ink-400">
            {/* Add Terms and Privacy links if they ever exist */}
            <span className="opacity-50">
              Crafted with care by{" "}
              <Link
                href="https://jonaylor.com"
                className="hover:underline hover:text-black"
              >
                Johannes Naylor
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
