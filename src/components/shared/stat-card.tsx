import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { decorativeTint } from "@/components/shared/decorative-tints";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";

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
		<InsetCard
			className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			texture="tl"
			textureAlpha={0.12}
		>
			<div className="relative flex flex-col gap-3 p-4 sm:p-5">
				<IconTile variant="soft" className={colors.icon}>
					<Icon />
				</IconTile>
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
		</InsetCard>
	);

	if (href) {
		return (
			<Link to={href as LinkProps["to"]} className="block">
				{content}
			</Link>
		);
	}

	return content;
}
