import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { HeaderActions } from "./header-actions";
import { useRouteCrumbs } from "./page-crumbs";

/**
 * The trail on the left, and on the right whatever controls the route below asks
 * for — see `HeaderActions`. The toggle lives in the sidebar itself so it is on
 * screen in both states, except below `md`, where the sidebar is a sheet and this
 * is the only thing that can open it.
 *
 * It sits in `container` so the trail lines up with the page's own title below it.
 */
export function AppHeader() {
	const crumbs = useRouteCrumbs();

	return (
		<header className="border-border/50 flex h-(--app-header-h) shrink-0 items-center border-b">
			<div className="container flex min-w-0 items-center gap-2">
				<SidebarTrigger className="-ml-1 shrink-0 md:hidden" />
				{crumbs.length > 0 && (
					<AppBreadcrumb items={crumbs} surface="plain" icons="all" />
				)}
				<div className="ml-auto flex shrink-0 items-center gap-2">
					<HeaderActions />
				</div>
			</div>
		</header>
	);
}
