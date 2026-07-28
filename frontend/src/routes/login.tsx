import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/useAuth";
import { captureEvent } from "@/lib/posthog";

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [showMagicLinkOption, setShowMagicLinkOption] = useState(false);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { login, signup } = useAuth();

	const redirectTo = searchParams.get("redirect") || "/projects";

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setMessage(null);

		if (isSignUp) {
			const result = await signup(email, password);
			if (result.error) {
				setError(result.error);
			} else {
				captureEvent("signup_started");
				if (result.message) {
					setMessage(result.message);
				} else {
					navigate(redirectTo);
				}
			}
		} else {
			const result = await login(email, password);
			if (result.error) {
				// Check if this might be a passwordless user
				if (result.error.includes("Invalid") && password.length > 0) {
					setShowMagicLinkOption(true);
					setError(
						"Invalid credentials. If you signed up via checkout, try the magic link option below.",
					);
				} else {
					setError(result.error);
				}
			} else {
				captureEvent("login_completed");
				navigate(redirectTo);
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

		try {
			const res = await api.post("/api/auth/magic-link", {
				email: email.trim(),
				redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
			});

			if (!res.ok) {
				const data = await res.json();
				setError(data.error || "Failed to send magic link");
			} else {
				setMessage("Check your email for a login link!");
				captureEvent("magic_link_requested");
			}
		} catch {
			setError("Failed to send magic link");
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
