import { Link } from "react-router";
import { useAuth } from "@/lib/auth/useAuth";
import { buttonClass } from "./ui/Button";

export function HeaderNav() {
	const { user, isLoading } = useAuth();

	return (
		<nav className="flex items-center gap-4 text-sm text-ink-600">
			<Link to={user ? "/billing" : "/pricing"} className="hover:text-ink-900">
				Pricing
			</Link>
			{user && (
				<>
					<Link to="/projects" className="hover:text-ink-900">
						Projects
					</Link>
					<Link to="/account" className="hover:text-ink-900">
						Account
					</Link>
				</>
			)}
			{isLoading ? (
				<span className="h-8 w-16" />
			) : user ? (
				<Link to="/project/new" className={buttonClass("nav", "sm")}>
					Builder
				</Link>
			) : (
				<Link to="/auth/login" className={buttonClass("nav", "sm")}>
					Sign in
				</Link>
			)}
		</nav>
	);
}
