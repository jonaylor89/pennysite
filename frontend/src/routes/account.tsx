import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/useAuth";

interface Preferences {
	unsubscribed_all: boolean;
	unsubscribed_drip: boolean;
	unsubscribed_reengagement: boolean;
}

function ToggleRow({
	label,
	description,
	checked,
	disabled,
	onChange,
}: {
	label: string;
	description: string;
	checked: boolean;
	disabled: boolean;
	onChange: () => void;
}) {
	return (
		<label className="flex items-start gap-3 cursor-pointer">
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={onChange}
				className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
			/>
			<div>
				<div className="text-sm font-medium">{label}</div>
				<div className="text-xs text-ink-600">{description}</div>
			</div>
		</label>
	);
}

function EmailPreferences({
	initialPreferences,
}: {
	initialPreferences: Preferences;
}) {
	const [prefs, setPrefs] = useState<Preferences>(initialPreferences);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function save(updated: Preferences) {
		setSaving(true);
		setSaved(false);
		setError(null);

		try {
			const res = await api.put("/api/account/email-preferences", updated);

			if (!res.ok) {
				setError("Failed to save preferences");
				return;
			}

			setPrefs(updated);
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch {
			setError("Failed to save preferences");
		} finally {
			setSaving(false);
		}
	}

	function toggle(key: keyof Preferences) {
		const updated = { ...prefs, [key]: !prefs[key] };
		// If turning off "all", also turn off subcategories
		if (key === "unsubscribed_all" && !prefs.unsubscribed_all) {
			updated.unsubscribed_drip = true;
			updated.unsubscribed_reengagement = true;
		}
		// If turning on any subcategory, turn off "all"
		if (key !== "unsubscribed_all" && prefs[key] && prefs.unsubscribed_all) {
			updated.unsubscribed_all = false;
		}
		save(updated);
	}

	return (
		<Card className="mt-6">
			<h2 className="font-semibold">Email Preferences</h2>
			<p className="mt-1 text-sm text-ink-600">
				Choose which emails you'd like to receive.
			</p>

			<div className="mt-5 space-y-4">
				<ToggleRow
					label="Tips & onboarding"
					description="Prompt tips, feature guides, and inspiration (days 0-30)"
					checked={!prefs.unsubscribed_drip}
					disabled={saving || prefs.unsubscribed_all}
					onChange={() => toggle("unsubscribed_drip")}
				/>
				<ToggleRow
					label="Re-engagement"
					description="Reminders about unpublished sites, unused credits, and refresh nudges"
					checked={!prefs.unsubscribed_reengagement}
					disabled={saving || prefs.unsubscribed_all}
					onChange={() => toggle("unsubscribed_reengagement")}
				/>

				<div className="border-t border-border pt-4">
					<ToggleRow
						label="Unsubscribe from all emails"
						description="This turns off everything, including celebration emails"
						checked={prefs.unsubscribed_all}
						disabled={saving}
						onChange={() => toggle("unsubscribed_all")}
					/>
				</div>
			</div>

			{saved && (
				<Alert variant="success" className="mt-4">
					Preferences saved
				</Alert>
			)}
			{error && (
				<Alert variant="danger" className="mt-4">
					{error}
				</Alert>
			)}
		</Card>
	);
}

function AccountActions() {
	const { logout } = useAuth();
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function handleSignOut() {
		await logout();
		navigate("/");
	}

	async function handleDeleteAccount() {
		if (confirmText !== "delete my account") return;

		setIsDeleting(true);
		setError(null);

		try {
			const res = await api.delete("/api/account");
			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Failed to delete account");
				setIsDeleting(false);
				return;
			}

			await logout();
			navigate("/");
		} catch {
			setError("Failed to delete account");
			setIsDeleting(false);
		}
	}

	return (
		<>
			<div className="mt-6">
				<Button variant="secondary" size="md" onClick={handleSignOut}>
					Sign Out
				</Button>
			</div>

			<Card variant="danger" className="mt-8">
				<h2 className="font-semibold text-error">Danger Zone</h2>

				<Card variant="default" padding="md" className="mt-4">
					<div className="font-medium">Delete account</div>
					<div className="mt-1 text-sm text-ink-600">
						Permanently delete your account and all your projects. This action
						cannot be undone.
					</div>

					{error && (
						<Alert variant="danger" className="mt-3">
							{error}
						</Alert>
					)}

					{showDeleteConfirm ? (
						<div className="mt-4">
							<p className="text-sm text-ink-600">
								Type{" "}
								<span className="font-mono text-ink-900">
									delete my account
								</span>{" "}
								to confirm:
							</p>
							<Input
								type="text"
								value={confirmText}
								onChange={(e) => setConfirmText(e.target.value)}
								className="mt-2"
								placeholder="delete my account"
								disabled={isDeleting}
							/>
							<div className="mt-3 flex gap-2">
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										setShowDeleteConfirm(false);
										setConfirmText("");
										setError(null);
									}}
									disabled={isDeleting}
								>
									Cancel
								</Button>
								<Button
									variant="danger"
									size="sm"
									loading={isDeleting}
									onClick={handleDeleteAccount}
									disabled={confirmText !== "delete my account"}
								>
									Delete My Account
								</Button>
							</div>
						</div>
					) : (
						<Button
							variant="danger-outline"
							size="sm"
							className="mt-4"
							onClick={() => setShowDeleteConfirm(true)}
						>
							Delete Account
						</Button>
					)}
				</Card>
			</Card>
		</>
	);
}

export function AccountPage() {
	const { user } = useAuth();
	const [emailPrefs, setEmailPrefs] = useState<Preferences | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		document.title = "Account - Pennysite";
	}, []);

	useEffect(() => {
		api
			.get("/api/account/email-preferences")
			.then((res) => res.json())
			.then((data) => {
				setEmailPrefs(
					data ?? {
						unsubscribed_all: false,
						unsubscribed_drip: false,
						unsubscribed_reengagement: false,
					},
				);
			})
			.catch(() => {
				setEmailPrefs({
					unsubscribed_all: false,
					unsubscribed_drip: false,
					unsubscribed_reengagement: false,
				});
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-canvas text-ink-600">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-canvas">
			<header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6">
				<Link to="/" className="text-sm font-semibold tracking-wide">
					Pennysite
				</Link>
				<nav className="flex items-center gap-4 text-sm text-ink-600">
					<Link to="/projects" className="hover:text-ink-900">
						Projects
					</Link>
					<Link to="/billing" className="hover:text-ink-900">
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
						<div className="mt-1">{user?.email}</div>
					</div>
				</div>

				{emailPrefs && <EmailPreferences initialPreferences={emailPrefs} />}

				<AccountActions />
			</main>
		</div>
	);
}
