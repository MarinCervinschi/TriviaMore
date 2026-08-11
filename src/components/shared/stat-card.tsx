import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

const colorMap: Record<string, { orb: string; badge: string; icon: string }> = {
	blue: { orb: "bg-blue-500/10", badge: "bg-blue-500/10", icon: "text-blue-500" },
	green: { orb: "bg-green-500/10", badge: "bg-green-500/10", icon: "text-green-500" },
	orange: {
		orb: "bg-orange-500/10",
		badge: "bg-orange-500/10",
		icon: "text-orange-500",
	},
	purple: {
		orb: "bg-purple-500/10",
		badge: "bg-purple-500/10",
		icon: "text-purple-500",
	},
	red: { orb: "bg-red-500/10", badge: "bg-red-500/10", icon: "text-red-500" },
	yellow: {
		orb: "bg-yellow-500/10",
		badge: "bg-yellow-500/10",
		icon: "text-yellow-500",
	},
	primary: { orb: "bg-primary/10", badge: "bg-primary/10", icon: "text-brand" },
};

// The one stat tile used across the admin dashboard, the user area and progress.
// `color` drives the orb, icon badge and icon tint together; an optional `href`
// turns the whole card into a link.
export function StatCard({
	label,
	value,
	icon: Icon,
	color = "primary",
	href,
	subtitle,
}: {
	label: string;
	value: string | number;
	icon: Icon;
	color?: string;
	href?: string;
	subtitle?: string;
}) {
	const colors = colorMap[color] ?? colorMap.primary;

	const content = (
		<div className="group bg-card relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5">
			<div
				className={cn(
					"pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full blur-[30px] transition-opacity duration-300 group-hover:opacity-70",
					colors.orb
				)}
			/>
			<div className="relative flex flex-col gap-3">
				<div className={cn("inline-flex w-fit rounded-xl p-2 sm:p-2.5", colors.badge)}>
					<Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.icon)} />
				</div>
				<div className="min-w-0">
					<p className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
						{label}
					</p>
					<p className="mt-0.5 truncate text-2xl font-bold tabular-nums sm:text-3xl">
						{value}
					</p>
					{subtitle && (
						<p className="text-muted-foreground mt-1 truncate text-xs">{subtitle}</p>
					)}
				</div>
			</div>
		</div>
	);

	if (href) {
		return <Link to={href as LinkProps["to"]}>{content}</Link>;
	}

	return content;
}
