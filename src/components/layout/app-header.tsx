import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { HeaderActions } from "./header-actions";
import { useRouteCrumbs } from "./page-crumbs";

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
