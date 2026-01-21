import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-fuchsia-500/25 to-emerald-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-white hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-10 lg:pb-28 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <section>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              No code • Pay as you go • Free hosting forever
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Create a website by describing it.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg text-zinc-300">
              Type what you want and Pennysite makes it. You’ll see it
              instantly, then you can ask for changes in plain English.
            </p>

            <div className="mt-6 grid max-w-xl gap-2 text-sm text-zinc-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                Make it in minutes
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                Keep editing by chatting
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                Save projects for later
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                Download your site anytime
              </div>
            </div>

            <form action="/builder" method="GET" className="mt-8 max-w-xl">
              <label htmlFor="prompt" className="sr-only">
                Describe your website
              </label>
              <div className="group relative">
                <input
                  id="prompt"
                  name="prompt"
                  type="text"
                  required
                  placeholder='e.g. "A website for my coffee shop with menu, hours, and contact"'
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 pr-24 text-base text-white placeholder:text-zinc-500 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition focus:border-zinc-600 focus:bg-zinc-900"
                />
                <div
                  aria-hidden="true"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
                >
                  Press Enter
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Press Enter to start. Keep refining it right after.
              </p>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                href="/builder?prompt=A+portfolio+website+for+a+photographer+with+gallery+and+contact+page"
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Photographer portfolio
              </Link>
              <Link
                href="/builder?prompt=A+simple+landing+page+for+my+app+with+features+pricing+FAQ+and+testimonials"
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                App landing page
              </Link>
              <Link
                href="/builder?prompt=A+website+for+my+gym+with+class+schedule+trainers+and+contact+info"
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Local gym
              </Link>
            </div>
          </section>

          <section className="lg:pl-8">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">How it works</p>
                <p className="text-xs text-zinc-400">Takes minutes</p>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="text-xs text-zinc-400">1. Describe it</p>
                  <p className="mt-1 text-sm text-zinc-200">
                    Say what your business does and what you want on the page.
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="text-xs text-zinc-400">2. See it</p>
                  <p className="mt-1 text-sm text-zinc-200">
                    Your website appears instantly with a live preview.
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="text-xs text-zinc-400">3. Adjust & publish</p>
                  <p className="mt-1 text-sm text-zinc-200">
                    Ask for edits, save your project, and publish when ready.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-sm font-medium">Looks great fast</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Start from a clean, modern layout.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-sm font-medium">More than one page</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Home, about, services, contact — whatever you need.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-sm font-medium">Take it with you</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Download your site files anytime.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative mx-auto w-full max-w-6xl px-6 pb-10 text-xs text-zinc-500">
        Build websites for pennies. Free hosting forever.
      </footer>
    </div>
  );
}
