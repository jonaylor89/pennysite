import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <main className="text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">
          Pennysite
        </h1>
        <p className="mb-8 max-w-md text-lg text-zinc-400">
          Build websites for pennies. AI-powered, no subscriptions, free hosting
          forever.
        </p>
        <Link
          href="/builder"
          className="inline-flex rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Start Building →
        </Link>
      </main>
    </div>
  );
}
