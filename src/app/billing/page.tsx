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
    <div className="min-h-screen bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-fg-strong">
          <Link href="/project/new" className="hover:text-fg">
            Builder
          </Link>
          <Link href="/projects" className="hover:text-fg">
            Projects
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-serif text-3xl tracking-[-0.02em]">Credits</h1>
        <p className="mt-2 text-fg-muted">
          Buy credits to generate websites. Pay only for what you use.
        </p>

        <BillingContent initialBalance={balance} />
      </main>
    </div>
  );
}
