import { BellIcon } from "@solar-icons/react/linear/bell";
import { HamburgerMenuIcon } from "@solar-icons/react/linear/hamburger-menu";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ENVIRONMENT_LABEL, IS_PRODUCTION } from "~/lib/environment";
import type { NavItem, NavSection } from "~/lib/nav";

import { CommandMenu } from "./command-menu";

export function ConsoleHeader({
	section,
	item,
	onOpenMenu,
}: {
	section: NavSection;
	item: NavItem | undefined;
	/** Opens the navigation on screens too narrow for the rail. */
	onOpenMenu: () => void;
}) {
	return (
		<header className="border-border/50 relative flex h-12 shrink-0 items-center gap-3 border-b px-3">
			<Button
				variant="ghost"
				size="icon"
				className="size-8 md:hidden"
				aria-label="Apri la navigazione"
				onClick={onOpenMenu}
			>
				<HamburgerMenuIcon className="size-4" />
			</Button>

			<Breadcrumb className="min-w-0">
				<BreadcrumbList className="flex-nowrap">
					<BreadcrumbItem className="hidden font-medium sm:inline-flex">
						Console
					</BreadcrumbItem>
					<BreadcrumbSeparator className="hidden sm:inline-flex" />
					<BreadcrumbItem className={item ? "hidden sm:inline-flex" : undefined}>
						{item ? section.label : <BreadcrumbPage>{section.label}</BreadcrumbPage>}
					</BreadcrumbItem>
					{item && (
						<>
							<BreadcrumbSeparator className="hidden sm:inline-flex" />
							<BreadcrumbItem>
								<BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>

			<div className="absolute left-1/2 hidden w-full max-w-sm -translate-x-1/2 md:block">
				<CommandMenu />
			</div>

			<div className="ml-auto flex items-center gap-2">
				<span
					className={cn(
						"hidden rounded-md border px-2 py-0.5 text-xs font-medium sm:inline-flex",
						IS_PRODUCTION
							? "bg-warning/10 text-warning border-warning/20"
							: "bg-info/10 text-info border-info/20"
					)}
				>
					{ENVIRONMENT_LABEL}
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="size-8"
					aria-label="Notifiche"
					disabled
				>
					<BellIcon className="size-4" />
				</Button>
			</div>
		</header>
	);
}
