import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ProjectList } from "@/components/ProjectList";
import { api } from "@/lib/api-client";

const PAGE_SIZE = 10;

interface ProjectRow {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
	deployed_url: string | null;
	pages: Record<string, unknown> | null;
}

interface ProjectWithPreview {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
	deployed_url: string | null;
	previewHtml: string | null;
}

export function ProjectsPage() {
	const [searchParams] = useSearchParams();
	const [projects, setProjects] = useState<ProjectWithPreview[] | null>(null);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);

	let page = Number.parseInt(searchParams.get("page") || "1", 10);
	if (Number.isNaN(page) || page < 1) {
		page = 1;
	}

	useEffect(() => {
		document.title = "Your Projects - Pennysite";
	}, []);

	useEffect(() => {
		setLoading(true);
		api
			.get(`/api/projects?page=${page}&pageSize=${PAGE_SIZE}`)
			.then((res) => res.json())
			.then((data) => {
				const rawProjects: ProjectRow[] = data.projects || [];
				const count: number = data.count || 0;

				const mapped = rawProjects.map(({ pages, ...rest }) => ({
					...rest,
					previewHtml:
						pages &&
						typeof pages === "object" &&
						!Array.isArray(pages) &&
						"index.html" in pages &&
						typeof (pages as Record<string, unknown>)["index.html"] === "string"
							? ((pages as Record<string, string>)["index.html"] as string)
							: null,
				}));

				setProjects(mapped);
				setTotalPages(Math.ceil(count / PAGE_SIZE));
			})
			.catch(() => {
				setProjects([]);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [page]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-canvas text-ink-600">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-canvas px-4 py-12">
			<div className="mx-auto max-w-6xl">
				<div className="mb-8 flex items-center justify-between">
					<h1 className="font-serif text-2xl tracking-[-0.02em] text-ink-900">
						Your Projects
					</h1>
					<div className="flex items-center gap-3">
						<Link
							to="/account"
							className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-2 hover:text-ink-900"
						>
							Account
						</Link>
						<Link
							to="/project/new"
							className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
						>
							New Project
						</Link>
					</div>
				</div>

				{projects && projects.length > 0 ? (
					<>
						<ProjectList projects={projects} />

						{totalPages > 1 && (
							<div className="mt-8 flex items-center justify-center gap-4">
								{page > 1 ? (
									<Link
										to={`/projects?page=${page - 1}`}
										className="flex items-center gap-1 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="m15 18-6-6 6-6" />
										</svg>
										Previous
									</Link>
								) : (
									<span className="flex items-center gap-1 text-sm font-medium text-ink-400">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="m15 18-6-6 6-6" />
										</svg>
										Previous
									</span>
								)}

								<span className="text-sm text-ink-400">
									Page {page} of {totalPages}
								</span>

								{page < totalPages ? (
									<Link
										to={`/projects?page=${page + 1}`}
										className="flex items-center gap-1 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
									>
										Next
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="m9 18 6-6-6-6" />
										</svg>
									</Link>
								) : (
									<span className="flex items-center gap-1 text-sm font-medium text-ink-400">
										Next
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="m9 18 6-6-6-6" />
										</svg>
									</span>
								)}
							</div>
						)}
					</>
				) : (
					<div className="rounded-md border border-border bg-surface p-8 text-center">
						<p className="text-ink-600">No projects yet</p>
						<Link
							to="/project/new"
							className="mt-4 inline-block text-ink-900 underline"
						>
							Create your first website
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
