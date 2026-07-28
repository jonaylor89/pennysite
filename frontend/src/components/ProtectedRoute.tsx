import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/lib/auth/useAuth";

export function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-canvas text-ink-600">
				Loading...
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<Navigate
				to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
				replace
			/>
		);
	}

	return <Outlet />;
}
