import Link from "next/link";
import { redirect } from "next/navigation";
import { estimateGenerationCredits } from "@/lib/billing/config";
import { getCreditBalance } from "@/lib/billing/credits";
import { createClient } from "@/lib/supabase/server";
import { BillingContent } from "./BillingContent";

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/billing");
  }

  const creditBalance = await getCreditBalance(user.id);
  const balance = {
    ...creditBalance,
    generationCost: estimateGenerationCredits(),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/project/new" className="hover:text-white">
            Builder
          </Link>
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Credits</h1>
        <p className="mt-2 text-zinc-400">
          Buy credits to generate websites. Pay only for what you use.
        </p>

        <BillingContent initialBalance={balance} />
      </main>
    </div>
  );
}
