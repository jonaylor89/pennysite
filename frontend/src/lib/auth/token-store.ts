/**
 * In-memory access token store.
 * Never stored in localStorage (prevents XSS exfiltration).
 * Refresh token is in an HttpOnly cookie managed by the server.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
	return accessToken;
}

export function setAccessToken(token: string | null): void {
	accessToken = token;
}

export function clearAccessToken(): void {
	accessToken = null;
}
