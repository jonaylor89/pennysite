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
    <nav className="flex items-center gap-4 text-sm text-ink-600">
      <Link
        href={user ? "/billing" : "/pricing"}
        className="hover:text-ink-900"
      >
        Pricing
      </Link>
      {user && (
        <>
          <Link href="/projects" className="hover:text-ink-900">
            Projects
          </Link>
          <Link href="/account" className="hover:text-ink-900">
            Account
          </Link>
        </>
      )}
      {loading ? (
        <span className="h-8 w-16" />
      ) : user ? (
        <Link href="/project/new" className={buttonClass("nav", "sm")}>
          Builder
        </Link>
      ) : (
        <Link href="/auth/login" className={buttonClass("nav", "sm")}>
          Sign in
        </Link>
      )}
    </nav>
  );
}
