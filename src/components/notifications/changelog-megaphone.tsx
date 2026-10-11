import { ConfettiIcon } from "@solar-icons/react/linear/confetti";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { changelogQueries } from "@/lib/changelogs/queries";

export function ChangelogMegaphoneRow({ onNavigate }: { onNavigate?: () => void }) {
	const { data: unreadVersions = [] } = useQuery(changelogQueries.unreadVersions());
	const unreadCount = unreadVersions.length;

	return (
		<Link
			to="/news"
			onClick={onNavigate}
			aria-label={`Novità${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
			className="hover:bg-accent flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors"
		>
			<ConfettiIcon className="size-4" />
			Novità
			{unreadCount > 0 && (
				<span className="bg-primary text-primary-foreground text-2xs ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-bold">
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			)}
		</Link>
	);
}
