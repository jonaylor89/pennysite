import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";

type Project = {
	id: string;
	name: string;
	pages: Record<string, string> | null;
	deployed_url: string | null;
	cf_project_name: string | null;
	last_deployed_at: string | null;
	custom_domain: string | null;
	custom_domain_status: string | null;
	custom_domain_added_at: string | null;
	is_public: boolean;
	created_at: string;
	updated_at: string;
};

export type ProjectStats = {
	totalGenerations: number;
	failedGenerations: number;
	totalCreditsUsed: number;
	totalInputTokens: number;
	totalOutputTokens: number;
	lastGenerationAt: string | null;
};

function formatNumber(num: number): string {
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
	if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
	return num.toString();
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function StatCard({
	label,
	value,
	subValue,
}: {
	label: string;
	value: string | number;
	subValue?: string;
}) {
	return (
		<div className="rounded-md border border-border bg-surface p-4">
			<div className="text-sm text-ink-600">{label}</div>
			<div className="mt-1 text-2xl font-semibold">{value}</div>
			{subValue && (
				<div className="mt-0.5 text-xs text-ink-400">{subValue}</div>
			)}
		</div>
	);
}

export function ProjectSettings({
	project,
	stats,
}: {
	project: Project;
	stats: ProjectStats;
}) {
	const navigate = useNavigate();
	const [isUnpublishing, setIsUnpublishing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPublic, setIsPublic] = useState(project.is_public);
	const [isTogglingPublic, setIsTogglingPublic] = useState(false);
	const [copied, setCopied] = useState(false);

	async function handleTogglePublic() {
		setIsTogglingPublic(true);
		setError(null);
		try {
			const res = await api.put(`/api/projects/${project.id}`, {
				is_public: !isPublic,
			});
			if (!res.ok) {
				const data = await res.json();
				setError(data.error || "Failed to update sharing");
				return;
			}
			setIsPublic(!isPublic);
		} catch {
			setError("Failed to update sharing");
		} finally {
			setIsTogglingPublic(false);
		}
	}

	function copyShareLink() {
		const url = `${window.location.origin}/project/${project.id}`;
		navigator.clipboard.writeText(url).catch(() => {});
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	async function handleUnpublish() {
		setIsUnpublishing(true);
		setError(null);
		try {
			const res = await api.post(`/api/projects/${project.id}/unpublish`);
			if (!res.ok) {
				const data = await res.json();
				setError(data.error || "Failed to unpublish");
				return;
			}
			setShowUnpublishConfirm(false);
			window.location.reload();
		} catch {
			setError("Failed to unpublish");
		} finally {
			setIsUnpublishing(false);
		}
	}

	async function handleDelete() {
		setIsDeleting(true);
		setError(null);
		try {
			const res = await api.delete(`/api/projects/${project.id}`);
			if (!res.ok) {
				const data = await res.json();
				setError(data.error || "Failed to delete project");
				return;
			}
			navigate("/projects");
		} catch {
			setError("Failed to delete project");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<div className="min-h-screen bg-canvas text-ink-900">
			<header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6">
				<Link to="/" className="text-sm font-semibold tracking-wide">
					Pennysite
				</Link>
				<nav className="flex items-center gap-4 text-sm text-ink-900">
					<Link
						to={`/project/${project.id}`}
						className={buttonClass("link", "sm")}
					>
						← Back to Editor
					</Link>
				</nav>
			</header>

			<main className="mx-auto max-w-2xl px-6 py-12">
				<h1 className="font-serif text-2xl tracking-[-0.02em]">
					{project.name}
				</h1>
				<p className="mt-1 text-sm text-ink-600">Project Settings</p>

				{error && (
					<Alert variant="danger" className="mt-6">
						{error}
					</Alert>
				)}

				<Card className="mt-8">
					<h2 className="font-semibold">Deployment</h2>
					{project.deployed_url ? (
						<>
							<div className="mt-3 flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-accent" />
								<span className="text-sm text-ink-900">Published</span>
							</div>
							<a
								href={project.deployed_url}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-2 block text-sm text-accent-text hover:underline"
							>
								{project.deployed_url}
							</a>
							{project.last_deployed_at && (
								<div className="mt-2 text-xs text-ink-400">
									Last deployed {formatDate(project.last_deployed_at)}
								</div>
							)}
						</>
					) : (
						<div className="mt-3 flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-ink-400" />
							<span className="text-sm text-ink-600">Not published</span>
						</div>
					)}
				</Card>

				<Card className="mt-6">
					<h2 className="font-semibold">Custom Domain</h2>
					{project.custom_domain ? (
						<div className="mt-3">
							<div className="flex items-center gap-2">
								<span
									className={`h-2 w-2 rounded-full ${project.custom_domain_status === "active" ? "bg-accent" : project.custom_domain_status === "pending" ? "bg-gold" : "bg-error"}`}
								/>
								<span className="text-sm text-ink-900">
									{project.custom_domain}
								</span>
							</div>
							{project.custom_domain_status === "pending" &&
								project.cf_project_name && (
									<div className="mt-3 rounded-md border border-border bg-surface p-3 text-xs text-ink-600">
										<p className="font-medium text-ink-900">
											DNS Configuration
										</p>
										<p className="mt-1">
											Add a CNAME record pointing to{" "}
											<code className="rounded bg-surface-2 px-1 py-0.5 text-accent-text">
												{project.cf_project_name}.pages.dev
											</code>
										</p>
									</div>
								)}
						</div>
					) : (
						<div className="mt-3 text-sm text-ink-600">
							{project.deployed_url
								? "No custom domain configured."
								: "Publish your project first to add a custom domain."}
						</div>
					)}
				</Card>

				<Card className="mt-6">
					<h2 className="font-semibold">Sharing</h2>
					<div className="mt-3 flex items-center justify-between">
						<div>
							<div className="text-sm text-ink-900">Make project public</div>
							<div className="text-xs text-ink-400">
								Anyone with the link can view the conversation and preview
							</div>
						</div>
						<button
							type="button"
							onClick={handleTogglePublic}
							disabled={isTogglingPublic}
							className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 ${isPublic ? "bg-accent" : "bg-surface-2"}`}
						>
							<span
								className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition duration-200 ease-in-out ${isPublic ? "translate-x-5" : "translate-x-0"}`}
							/>
						</button>
					</div>
					{isPublic && (
						<div className="mt-4 flex items-center gap-2">
							<Input
								type="text"
								readOnly
								value={`${window.location.origin}/project/${project.id}`}
								className="flex-1"
							/>
							<Button variant="secondary" size="sm" onClick={copyShareLink}>
								{copied ? "Copied!" : "Copy"}
							</Button>
						</div>
					)}
				</Card>

				<Card className="mt-6">
					<h2 className="font-semibold">Usage</h2>
					<div className="mt-4 grid grid-cols-2 gap-3">
						<StatCard
							label="Credits Used"
							value={formatNumber(stats.totalCreditsUsed)}
							subValue={`$${(stats.totalCreditsUsed * 0.1).toFixed(2)} value`}
						/>
						<StatCard
							label="Generations"
							value={stats.totalGenerations}
							subValue={
								stats.failedGenerations > 0
									? `${stats.failedGenerations} failed`
									: undefined
							}
						/>
						<StatCard
							label="Input Tokens"
							value={formatNumber(stats.totalInputTokens)}
							subValue="prompts & context"
						/>
						<StatCard
							label="Output Tokens"
							value={formatNumber(stats.totalOutputTokens)}
							subValue="generated HTML"
						/>
					</div>
				</Card>

				<Card className="mt-6">
					<h2 className="font-semibold">Project Info</h2>
					<div className="mt-3 space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-ink-600">Created</span>
							<span>{formatDate(project.created_at)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-ink-600">Last updated</span>
							<span>{formatDate(project.updated_at)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-ink-600">Project ID</span>
							<code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-ink-600">
								{project.id}
							</code>
						</div>
					</div>
				</Card>

				<Card variant="danger" className="mt-8">
					<h2 className="font-semibold text-error">Danger Zone</h2>
					{project.deployed_url && (
						<Card
							variant="default"
							padding="md"
							className="mt-4 flex items-center justify-between"
						>
							<div>
								<div className="font-medium">Unpublish project</div>
								<div className="text-sm text-ink-600">
									Remove from the web. Your project files will be preserved.
								</div>
							</div>
							{showUnpublishConfirm ? (
								<div className="flex gap-2">
									<Button
										variant="secondary"
										size="sm"
										onClick={() => setShowUnpublishConfirm(false)}
										disabled={isUnpublishing}
									>
										Cancel
									</Button>
									<Button
										variant="danger"
										size="sm"
										onClick={handleUnpublish}
										disabled={isUnpublishing}
									>
										{isUnpublishing ? "Unpublishing..." : "Confirm"}
									</Button>
								</div>
							) : (
								<Button
									variant="danger-outline"
									size="sm"
									onClick={() => setShowUnpublishConfirm(true)}
								>
									Unpublish
								</Button>
							)}
						</Card>
					)}
					<Card
						variant="default"
						padding="md"
						className="mt-4 flex items-center justify-between"
					>
						<div>
							<div className="font-medium">Delete project</div>
							<div className="text-sm text-ink-600">
								Permanently delete this project and all its data.
							</div>
						</div>
						{showDeleteConfirm ? (
							<div className="flex gap-2">
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setShowDeleteConfirm(false)}
									disabled={isDeleting}
								>
									Cancel
								</Button>
								<Button
									variant="danger"
									size="sm"
									onClick={handleDelete}
									disabled={isDeleting}
								>
									{isDeleting ? "Deleting..." : "Delete Forever"}
								</Button>
							</div>
						) : (
							<Button
								variant="danger-outline"
								size="sm"
								onClick={() => setShowDeleteConfirm(true)}
							>
								Delete Project
							</Button>
						)}
					</Card>
				</Card>
			</main>
		</div>
	);
}
