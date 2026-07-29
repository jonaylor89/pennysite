import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/lib/auth/context";
import { Sentry } from "@/lib/sentry";
import { AboutPage } from "@/routes/about";
import { AccountPage } from "@/routes/account";
import { AuthCallbackPage } from "@/routes/auth-callback";
import { BillingPage } from "@/routes/billing";
// Page imports
import { LandingPage } from "@/routes/index";
import { LoginPage } from "@/routes/login";
import { NotFoundPage } from "@/routes/not-found";
import { PricingPage } from "@/routes/pricing";
import { ProjectEditorPage } from "@/routes/project-editor";
import { ProjectNewPage } from "@/routes/project-new";
import { ProjectSettingsPage } from "@/routes/project-settings";
import { ProjectsPage } from "@/routes/projects";

export function App() {
	return (
		<Sentry.ErrorBoundary
			fallback={<p>Something went wrong. Please refresh the page.</p>}
		>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						{/* Public routes */}
						<Route path="/" element={<LandingPage />} />
						<Route path="/auth/login" element={<LoginPage />} />
						<Route path="/auth/callback" element={<AuthCallbackPage />} />
						<Route path="/pricing" element={<PricingPage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/project/new" element={<ProjectNewPage />} />
						<Route path="/project/:projectId" element={<ProjectEditorPage />} />

						{/* Protected routes */}
						<Route element={<ProtectedRoute />}>
							<Route path="/projects" element={<ProjectsPage />} />
							<Route
								path="/project/:projectId/settings"
								element={<ProjectSettingsPage />}
							/>
							<Route path="/billing" element={<BillingPage />} />
							<Route path="/account" element={<AccountPage />} />
						</Route>

						{/* 404 */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</Sentry.ErrorBoundary>
	);
}
