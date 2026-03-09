"use client";

import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { Suspense, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showMagicLinkOption, setShowMagicLinkOption] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectTo = searchParams.get("redirect") || "/projects";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        if (data.user) {
          posthog.identify(data.user.id, { email: data.user.email });
          posthog.capture("signup_started");
        }
        setMessage("Check your email for a confirmation link!");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // Check if this might be a passwordless user
        if (
          error.message.includes("Invalid login credentials") &&
          password.length > 0
        ) {
          setShowMagicLinkOption(true);
          setError(
            "Invalid credentials. If you signed up via checkout, try the magic link option below.",
          );
        } else {
          setError(error.message);
        }
      } else {
        if (data.user) {
          posthog.identify(data.user.id, { email: data.user.email });
          posthog.capture("login_completed");
        }
        router.push(redirectTo);
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      setError("Please enter your email first");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a login link!");
      posthog.capture("magic_link_requested");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center font-serif text-2xl text-ink-900">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
          {message && <p className="text-sm text-accent-text">{message}</p>}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            type="submit"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        {/* Magic link option for passwordless users */}
        {!isSignUp && (showMagicLinkOption || !password) && (
          <div className="mt-4 border-t border-border pt-4">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleMagicLink}
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Send me a login link instead"}
            </Button>
            <p className="mt-2 text-center text-xs text-ink-400">
              We'll email you a link to sign in without a password
            </p>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-ink-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
              setShowMagicLinkOption(false);
            }}
            className="text-ink-900 underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-600">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
