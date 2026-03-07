"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "./ui/Button";

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
    <nav className="flex items-center gap-4 text-sm text-fg-strong">
      <Link href={user ? "/billing" : "/pricing"} className="hover:text-fg">
        Pricing
      </Link>
      {user && (
        <>
          <Link href="/projects" className="hover:text-fg">
            Projects
          </Link>
          <Link href="/account" className="hover:text-fg">
            Account
          </Link>
        </>
      )}
      {loading ? (
        <span className="h-8 w-16" />
      ) : user ? (
        <Link
          href="/project/new"
          className={buttonClass(
            "ghost",
            "sm",
            "rounded-pill border-border bg-surface-alt text-fg",
          )}
        >
          Builder
        </Link>
      ) : (
        <Link
          href="/auth/login"
          className={buttonClass(
            "ghost",
            "sm",
            "rounded-pill border-border bg-surface-alt text-fg",
          )}
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
