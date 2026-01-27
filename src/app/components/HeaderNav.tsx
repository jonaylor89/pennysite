"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function HeaderNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, [supabase.auth]);

  return (
    <nav className="flex items-center gap-4 text-sm text-zinc-300">
      <Link href="/billing" className="hover:text-white">
        Pricing
      </Link>
      {user && (
        <Link href="/projects" className="hover:text-white">
          Projects
        </Link>
      )}
      {loading ? (
        <span className="h-8 w-16" />
      ) : user ? (
        <Link
          href="/project/new"
          className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-white hover:bg-zinc-900"
        >
          Builder
        </Link>
      ) : (
        <Link
          href="/auth/login"
          className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-white hover:bg-zinc-900"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
