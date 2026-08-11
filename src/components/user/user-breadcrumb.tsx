import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { HomeIcon } from "@solar-icons/react/linear/home";
import { Link } from "@tanstack/react-router";

export function UserBreadcrumb({ current }: { current: string }) {
	return (
		<nav className="bg-background inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-sm">
			<Link
				to="/user"
				className="text-muted-foreground hover:text-foreground flex items-center gap-1"
			>
				<HomeIcon className="h-4 w-4" />
				Dashboard
			</Link>
			<AltArrowRightIcon className="text-muted-foreground/50 h-3.5 w-3.5" />
			<span className="text-foreground font-medium">{current}</span>
		</nav>
	);
}
