import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountActions } from "./AccountActions";
import { EmailPreferences } from "./EmailPreferences";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  const { data: emailPrefs } = await supabase
    .from("email_preferences")
    .select("unsubscribed_all, unsubscribed_drip, unsubscribed_reengagement")
    .eq("user_id", user.id)
    .single();

  const initialPrefs = emailPrefs ?? {
    unsubscribed_all: false,
    unsubscribed_drip: false,
    unsubscribed_reengagement: false,
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-600">
          <Link href="/projects" className="hover:text-ink-900">
            Projects
          </Link>
          <Link href="/billing" className="hover:text-ink-900">
            Billing
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-serif text-2xl tracking-[-0.02em]">Account</h1>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Account Information</h2>
          <div className="mt-4">
            <div className="text-sm text-ink-600">Email</div>
            <div className="mt-1">{user.email}</div>
          </div>
        </div>

        <EmailPreferences initialPreferences={initialPrefs} />

        <AccountActions />
      </main>
    </div>
  );
}
