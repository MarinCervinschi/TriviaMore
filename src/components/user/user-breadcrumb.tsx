import { HomeIcon } from "@solar-icons/react/linear/home";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { AppBreadcrumb, type Crumb } from "@/components/shared/app-breadcrumb";

type CrumbInput = { label: string; to: LinkProps["to"]; icon?: Icon };

export function UserBreadcrumb({
	current,
	currentIcon,
	trail = [],
}: {
	current: string;
	currentIcon?: Icon;
	/** Intermediate, linked crumbs between Dashboard and the current page. */
	trail?: CrumbInput[];
}) {
	const items: Crumb[] = [
		{ label: "Dashboard", to: "/user", icon: HomeIcon },
		...trail,
		{ label: current, icon: currentIcon },
	];

	return <AppBreadcrumb items={items} />;
}
