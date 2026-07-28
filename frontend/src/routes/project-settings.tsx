import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";

interface Project {
	id: string;
	name: string;
	deployed_url: string | null;
	cf_project_name: string | null;
	custom_domain: string | null;
	custom_domain_status: "pending" | "active" | "error" | null;
	custom_domain_added_at: string | null;
	last_deployed_at: string | null;
	is_public: boolean;
	created_at: string;
	updated_at: string;
}

interface ProjectStats {
	totalGenerations: number;
	completedGenerations: number;
	failedGenerations: number;
	totalCreditsUsed: number;
	totalInputTokens: number;
	totalOutputTokens: number;
	lastGenerationAt: string | null;
}

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

export function ProjectSettingsPage() {
	const { projectId } = useParams<{ projectId: string }>();
	const navigate = useNavigate();
	const [project, setProject] = useState<Project | null>(null);
	const [stats, setStats] = useState<ProjectStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	const [isUnpublishing, setIsUnpublishing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPublic, setIsPublic] = useState(false);
	const [isTogglingPublic, setIsTogglingPublic] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		document.title = "Project Settings - Pennysite";
	}, []);

	useEffect(() => {
		if (!projectId) return;

		async function fetchData() {
			setLoading(true);
			try {
				const [projectRes, statsRes] = await Promise.all([
					api.get(`/api/projects/${projectId}`),
					api.get(`/api/projects/${projectId}/stats`),
				]);

				if (!projectRes.ok) {
					setNotFound(true);
					return;
				}

				const projectData = await projectRes.json();
				setProject(projectData);
				setIsPublic(projectData.is_public);

				if (statsRes.ok) {
					const statsData = await statsRes.json();
					setStats(statsData);
				} else {
					setStats({
						totalGenerations: 0,
						completedGenerations: 0,
						failedGenerations: 0,
						totalCreditsUsed: 0,
						totalInputTokens: 0,
						totalOutputTokens: 0,
						lastGenerationAt: null,
					});
				}
			} catch {
				setNotFound(true);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [projectId]);

	async function handleTogglePublic() {
		if (!project) return;
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
		if (!project) return;
		const url = `${window.location.origin}/project/${project.id}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	async function handleUnpublish() {
		if (!project) return;
		setIsUnpublishing(true);
		setError(null);
		try {
			const res = await api.post(`/api/projects/${project.id}/unpublish`);
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to unpublish");
				return;
			}
			// Re-fetch project to get updated state
			const refreshRes = await api.get(`/api/projects/${project.id}`);
			if (refreshRes.ok) {
				const refreshed = await refreshRes.json();
				setProject(refreshed);
			}
			setShowUnpublishConfirm(false);
		} catch {
			setError("Failed to unpublish");
		} finally {
			setIsUnpublishing(false);
		}
	}

	async function handleDelete() {
		if (!project) return;
		setIsDeleting(true);
		setError(null);
		try {
			const res = await api.delete(`/api/projects/${project.id}`);
			const data = await res.json();
			if (!res.ok) {
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

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-canvas text-ink-600">
				Loading...
			</div>
		);
	}

	if (notFound || !project || !stats) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-ink-900">
				<h1 className="font-serif text-2xl">Project not found</h1>
				<Link to="/projects" className="mt-4 text-accent-text underline">
					Back to projects
				</Link>
			</div>
		);
	}

	const domainStatusColor: Record<string, string> = {
		pending: "text-gold-text",
		active: "text-accent-text",
		error: "text-error",
	};

	const domainStatusLabel: Record<string, string> = {
		pending: "Pending DNS verification",
		active: "Active",
		error: "DNS verification failed",
	};

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
						&larr; Back to Editor
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

				{/* Deployment Status */}
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

				{/* Custom Domain */}
				<Card className="mt-6">
					<h2 className="font-semibold">Custom Domain</h2>
					{project.custom_domain ? (
						<div className="mt-3">
							<div className="flex items-center gap-2">
								<span
									className={`h-2 w-2 rounded-full ${
										project.custom_domain_status === "active"
											? "bg-accent"
											: project.custom_domain_status === "pending"
												? "bg-gold"
												: "bg-error"
									}`}
								/>
								<span className="text-sm text-ink-900">
									{project.custom_domain}
								</span>
							</div>
							<div
								className={`mt-1 text-xs ${domainStatusColor[project.custom_domain_status ?? "pending"]}`}
							>
								{domainStatusLabel[project.custom_domain_status ?? "pending"]}
							</div>
							{project.custom_domain_added_at && (
								<div className="mt-1 text-xs text-ink-400">
									Added {formatDate(project.custom_domain_added_at)}
								</div>
							)}
							{project.custom_domain_status === "pending" && (
								<div className="mt-3 rounded-md border border-border bg-surface p-3 text-xs text-ink-600">
									<p className="font-medium text-ink-900">DNS Configuration</p>
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
								? "No custom domain configured. Add one from the editor."
								: "Publish your project first to add a custom domain."}
						</div>
					)}
				</Card>

				{/* Sharing */}
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
							className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 ${
								isPublic ? "bg-accent" : "bg-surface-2"
							}`}
						>
							<span
								className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-accent shadow transition duration-200 ease-in-out ${
									isPublic ? "translate-x-5" : "translate-x-0"
								}`}
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

				{/* Usage Stats */}
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
					{stats.lastGenerationAt && (
						<div className="mt-4 text-xs text-ink-400">
							Last generation: {formatDate(stats.lastGenerationAt)}
						</div>
					)}
				</Card>

				{/* Project Info */}
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

				{/* Danger Zone */}
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
