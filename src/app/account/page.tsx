import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountActions } from "./AccountActions";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>
          <Link href="/billing" className="hover:text-white">
            Billing
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Account</h1>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold">Account Information</h2>
          <div className="mt-4">
            <div className="text-sm text-zinc-400">Email</div>
            <div className="mt-1">{user.email}</div>
          </div>
        </div>

        <AccountActions />
      </main>
    </div>
  );
}
