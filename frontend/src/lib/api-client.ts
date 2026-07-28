import { getAccessToken, setAccessToken } from "./auth/token-store";

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function refreshAccessToken(): Promise<boolean> {
	try {
		const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
			method: "POST",
			credentials: "include",
		});
		if (!res.ok) return false;
		const data = await res.json();
		setAccessToken(data.accessToken);
		return true;
	} catch {
		return false;
	}
}

async function request(
	path: string,
	options: RequestInit = {},
): Promise<Response> {
	const token = getAccessToken();
	const headers = new Headers(options.headers);
	if (token) headers.set("Authorization", `Bearer ${token}`);
	if (
		!headers.has("Content-Type") &&
		options.body &&
		typeof options.body === "string"
	) {
		headers.set("Content-Type", "application/json");
	}

	let res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers,
		credentials: "include",
	});

	// Auto-refresh on 401
	if (res.status === 401 && token) {
		const refreshed = await refreshAccessToken();
		if (refreshed) {
			const newToken = getAccessToken();
			if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
			res = await fetch(`${BASE_URL}${path}`, {
				...options,
				headers,
				credentials: "include",
			});
		}
	}

	return res;
}

export const api = {
	get: (path: string) => request(path, { method: "GET" }),

	post: (path: string, body?: unknown) =>
		request(path, {
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		}),

	put: (path: string, body?: unknown) =>
		request(path, {
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		}),

	delete: (path: string) => request(path, { method: "DELETE" }),

	/**
	 * Raw fetch with auth header — for SSE streaming where we need
	 * the raw Response object.
	 */
	raw: async (path: string, options: RequestInit = {}) => {
		const token = getAccessToken();
		const headers = new Headers(options.headers);
		if (token) headers.set("Authorization", `Bearer ${token}`);
		let res = await fetch(`${BASE_URL}${path}`, {
			...options,
			headers,
			credentials: "include",
		});

		// Auto-refresh on 401
		if (res.status === 401 && token) {
			const refreshed = await refreshAccessToken();
			if (refreshed) {
				const newToken = getAccessToken();
				if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
				res = await fetch(`${BASE_URL}${path}`, {
					...options,
					headers,
					credentials: "include",
				});
			}
		}

		return res;
	},
};
