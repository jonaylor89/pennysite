import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { api } from "@/lib/api-client";
import { setAccessToken } from "@/lib/auth/token-store";
import { useAuth } from "@/lib/auth/useAuth";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("redirect") || searchParams.get("next") || "/projects";

    if (!code) {
      navigate("/auth/login?error=auth_failed", { replace: true });
      return;
    }

    async function exchangeCode() {
      try {
        const res = await api.post("/api/auth/exchange-code", { code });
        if (res.ok) {
          const data = await res.json();
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
          await refreshUser();
          navigate(next, { replace: true });
        } else {
          navigate("/auth/login?error=auth_failed", { replace: true });
        }
      } catch {
        navigate("/auth/login?error=auth_failed", { replace: true });
      }
    }

    exchangeCode();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-600">
      {error ? error : "Signing in..."}
    </div>
  );
}
