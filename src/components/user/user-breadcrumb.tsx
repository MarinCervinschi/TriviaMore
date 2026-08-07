import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export function UserBreadcrumb({ current }: { current: string }) {
	return (
		<nav className="bg-background/70 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-sm">
			<Link
				to="/user"
				className="text-muted-foreground hover:text-foreground flex items-center gap-1"
			>
				<Home className="h-4 w-4" />
				Dashboard
			</Link>
			<ChevronRight className="text-muted-foreground/50 h-3.5 w-3.5" />
			<span className="text-foreground font-medium">{current}</span>
		</nav>
	);
}
