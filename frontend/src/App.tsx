import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Page imports
import { LandingPage } from "@/routes/index";
import { LoginPage } from "@/routes/login";
import { AuthCallbackPage } from "@/routes/auth-callback";
import { ProjectsPage } from "@/routes/projects";
import { ProjectNewPage } from "@/routes/project-new";
import { ProjectEditorPage } from "@/routes/project-editor";
import { ProjectSettingsPage } from "@/routes/project-settings";
import { PricingPage } from "@/routes/pricing";
import { BillingPage } from "@/routes/billing";
import { AccountPage } from "@/routes/account";
import { AboutPage } from "@/routes/about";
import { NotFoundPage } from "@/routes/not-found";

export function App() {
  return (
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
  );
}
