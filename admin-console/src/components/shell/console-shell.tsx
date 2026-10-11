import { type ReactNode, useState } from "react";

import { Logout2Icon } from "@solar-icons/react/linear/logout-2";
import { useRouterState } from "@tanstack/react-router";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/ui/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { ConsoleAccount } from "~/lib/auth/types";
import { useSignOut } from "~/lib/auth/use-sign-out";
import { NAV, itemOf, sectionOf } from "~/lib/nav";
import { writeSectionSidebarOpen } from "~/lib/section-sidebar-state";

import { ConsoleHeader } from "./console-header";
import { Rail } from "./rail";
import { SectionSidebar } from "./section-sidebar";

/** The rail of sections, then one inset panel holding the header, the section's own sidebar and the page. */
export function ConsoleShell({
	children,
	defaultSidebarOpen,
	account,
}: {
	children: ReactNode;
	defaultSidebarOpen: boolean;
	account: ConsoleAccount;
}) {
	const pathname = useRouterState({ select: state => state.location.pathname });
	const section = sectionOf(pathname);
	const item = itemOf(pathname);

	const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
	const [menuOpen, setMenuOpen] = useState(false);
	const signOut = useSignOut();

	const toggleSidebar = () => {
		setSidebarOpen(open => {
			writeSectionSidebarOpen(!open);
			return !open;
		});
	};

	return (
		<div className="bg-sidebar text-sidebar-foreground flex h-svh">
			<Rail active={section} account={account} />

			<div
				id="main-content"
				className="bg-card text-card-foreground border-border/50 flex min-w-0 flex-1 flex-col overflow-hidden shadow-xs md:my-2 md:mr-2 md:rounded-3xl md:border"
			>
				<ConsoleHeader
					section={section}
					item={item}
					onOpenMenu={() => setMenuOpen(true)}
				/>

				<div className="relative flex min-h-0 flex-1">
					{!section.fullBleed && (
						<>
							<div
								className={cn(
									"border-border/50 hidden shrink-0 overflow-hidden transition-[width] duration-200 motion-reduce:transition-none md:block",
									sidebarOpen ? "w-56 border-r" : "w-0"
								)}
							>
								<div className="h-full w-56">
									<SectionSidebar section={section} pathname={pathname} />
								</div>
							</div>

							<button
								type="button"
								onClick={toggleSidebar}
								aria-expanded={sidebarOpen}
								aria-label={
									sidebarOpen
										? "Chiudi la barra della sezione"
										: "Apri la barra della sezione"
								}
								className={cn(
									"group focus-visible:ring-ring absolute top-1/2 z-10 hidden h-12 w-3 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-2 md:flex",
									"transition-[left] duration-200 motion-reduce:transition-none",
									sidebarOpen ? "left-[calc(14rem-0.375rem)]" : "left-0.5"
								)}
							>
								<span className="bg-border group-hover:bg-muted-foreground/60 h-8 w-1 rounded-full transition-colors motion-reduce:transition-none" />
							</button>
						</>
					)}

					<main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
				</div>
			</div>

			<Sheet open={menuOpen} onOpenChange={setMenuOpen}>
				<SheetContent side="left" className="w-72 p-0">
					<div className="flex h-12 items-center gap-2 border-b pr-12 pl-4">
						<LogoIcon size={22} />
						<SheetTitle className="flex-1 text-sm font-semibold">Console</SheetTitle>
						<ThemeToggle className="size-8" />
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							aria-label="Esci"
							onClick={() => void signOut()}
						>
							<Logout2Icon className="size-4" />
						</Button>
					</div>
					<div className="h-[calc(100%-3rem)] overflow-y-auto">
						{NAV.map(entry => (
							<SectionSidebar
								key={entry.id}
								section={entry}
								pathname={pathname}
								onNavigate={() => setMenuOpen(false)}
								showNote={false}
							/>
						))}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
