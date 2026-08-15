import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { decorativeTint } from "@/components/shared/decorative-tints";
import { Card, CardTexture } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// The one stat tile used across the admin dashboard, the user area and progress.
// `color` drives the icon badge and icon tint together; an optional `href`
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
	const colors = decorativeTint(color);

	const content = (
		<Card className="group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5">
			<CardTexture placement="tl" alpha={0.12} />
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
		</Card>
	);

	if (href) {
		return <Link to={href as LinkProps["to"]}>{content}</Link>;
	}

	return content;
}
