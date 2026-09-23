import { useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { Logout3Icon } from "@solar-icons/react/linear/logout-3";
import { MenuDotsIcon } from "@solar-icons/react/linear/menu-dots";
import { MonitorIcon } from "@solar-icons/react/linear/monitor";
import { MoonIcon } from "@solar-icons/react/linear/moon";
import { PaletteIcon } from "@solar-icons/react/linear/palette";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { Sun2Icon } from "@solar-icons/react/linear/sun-2";
import { Link, useMatchRoute } from "@tanstack/react-router";

import { ChangelogMegaphoneRow } from "@/components/notifications/changelog-megaphone";
import { SidebarNotificationBell } from "@/components/notifications/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LogoIcon } from "@/components/ui/logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { getRoleTheme } from "@/lib/admin/role-theme";
import { runThemeTransition } from "@/lib/theme-transition";
import { getRoleLabel } from "@/lib/user/utils";
import { cn } from "@/lib/utils";

import {
	ADMIN_ITEM,
	CATALOG_ITEMS,
	HOME_ITEM,
	type NavItem,
	REQUESTS_ITEM,
	STUDY_ITEMS,
	getInitials,
	useIsAdmin,
} from "./nav-items";

const ACTIVE_ROW = "data-[active=true]:text-brand";

/** Stands in for the group labels once they are hidden, and only then. */
function RailDot() {
	return (
		<div
			aria-hidden
			className="hidden justify-center py-1 group-data-[collapsible=icon]:flex"
		>
			<span className="bg-sidebar-border size-1 rounded-full" />
		</div>
	);
}

/**
 * A destination, or a parent that nests. A parent is never highlighted itself: its
 * own page is the first of its children, so lighting both would mark two rows for
 * one location.
 */
function NavRow({ item }: { item: NavItem }) {
	const matchRoute = useMatchRoute();
	const { state, isMobile } = useSidebar();

	const ownActive = !!matchRoute({ to: item.to, fuzzy: item.fuzzy });
	const childActive = (item.children ?? []).some(
		child => !!matchRoute({ to: child.to, fuzzy: false })
	);
	const sectionActive = ownActive || childActive;

	/*
	 * Opens whenever you land inside the section, wherever you came from. A
	 * `defaultOpen` applies only on mount, so arriving from the dashboard left the
	 * group shut. Adjusted during render rather than in an effect, which would paint
	 * it closed for a frame first.
	 */
	const [groupOpen, setGroupOpen] = useState(sectionActive);
	const [flyoutOpen, setFlyoutOpen] = useState(false);
	const [wasActive, setWasActive] = useState(sectionActive);
	if (sectionActive !== wasActive) {
		setWasActive(sectionActive);
		if (sectionActive) setGroupOpen(true);
	}

	const Icon = item.icon;
	const isCollapsed = state === "collapsed" && !isMobile;

	if (!item.children) {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton
					asChild
					isActive={ownActive}
					tooltip={item.label}
					className={ACTIVE_ROW}
				>
					<Link to={item.to} aria-current={ownActive ? "page" : undefined}>
						<Icon />
						<span>{item.label}</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	/*
	 * Collapsed the children go in a flyout: there is no width for a submenu, and
	 * opening the first child for the user would be a guess.
	 *
	 * No `tooltip` here on purpose — `SidebarMenuButton` wraps itself in one, and
	 * `PopoverTrigger asChild` would then clone its props onto the tooltip wrapper
	 * instead of the button. The flyout names the section itself.
	 */
	if (isCollapsed) {
		return (
			<SidebarMenuItem>
				<Popover open={flyoutOpen} onOpenChange={setFlyoutOpen}>
					<PopoverTrigger asChild>
						<SidebarMenuButton isActive={sectionActive} className={ACTIVE_ROW}>
							<Icon />
							<span>{item.label}</span>
						</SidebarMenuButton>
					</PopoverTrigger>
					<PopoverContent
						side="right"
						align="start"
						sideOffset={8}
						className="w-56 p-1"
					>
						<p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
							{item.label}
						</p>
						{item.children.map(child => {
							const ChildIcon = child.icon;
							const active = !!matchRoute({ to: child.to, fuzzy: false });
							return (
								<Link
									key={child.to}
									to={child.to}
									onClick={() => setFlyoutOpen(false)}
									aria-current={active ? "page" : undefined}
									className={cn(
										"hover:bg-accent flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
										active && "text-brand"
									)}
								>
									<ChildIcon className="size-4 shrink-0" />
									{child.label}
								</Link>
							);
						})}
					</PopoverContent>
				</Popover>
			</SidebarMenuItem>
		);
	}

	return (
		<Collapsible open={groupOpen} onOpenChange={setGroupOpen} className="group/sub">
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton className={ACTIVE_ROW}>
						<Icon />
						<span>{item.label}</span>
						<AltArrowDownIcon className="ml-auto size-4 transition-transform group-data-[state=open]/sub:rotate-180 motion-reduce:transition-none" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.children.map(child => {
							const ChildIcon = child.icon;
							// Exact: the parent matches fuzzily, so every child would light up.
							const active = !!matchRoute({ to: child.to, fuzzy: false });
							return (
								<SidebarMenuSubItem key={child.to}>
									<SidebarMenuSubButton asChild isActive={active}>
										<Link to={child.to} aria-current={active ? "page" : undefined}>
											<ChildIcon />
											<span>{child.label}</span>
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							);
						})}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}

const THEME_OPTIONS = [
	{ value: "light" as const, label: "Chiaro", icon: Sun2Icon },
	{ value: "dark" as const, label: "Scuro", icon: MoonIcon },
	{ value: "system" as const, label: "Sistema", icon: MonitorIcon },
];

function ProfileRow() {
	const { user, logout } = useAuth();
	const { isMobile } = useSidebar();
	const { theme, setTheme, mounted } = useTheme();
	const initials = getInitials(user?.name, user?.email);
	const role = getRoleTheme(user?.role);

	return (
		<SidebarMenuItem>
			<Popover>
				<PopoverTrigger asChild>
					<SidebarMenuButton size="lg" tooltip={user?.name ?? "Profilo"}>
						<Avatar className="size-8 rounded-lg">
							<AvatarImage src={user?.image ?? undefined} alt="" />
							<AvatarFallback className="bg-primary/10 text-brand text-2xs rounded-lg font-semibold">
								{initials}
							</AvatarFallback>
						</Avatar>
						<span className="grid flex-1 text-left leading-tight">
							<span className="truncate text-sm font-medium">
								{user?.name ?? "Utente"}
							</span>
							<span className="text-muted-foreground flex items-center gap-1.5 text-xs">
								<span
									aria-hidden
									className={cn("size-1.5 shrink-0 rounded-full", role.dot)}
								/>
								<span className="truncate">
									{getRoleLabel(user?.role ?? "STUDENT")}
								</span>
							</span>
						</span>
						<MenuDotsIcon className="text-muted-foreground ml-auto size-4" />
					</SidebarMenuButton>
				</PopoverTrigger>

				<PopoverContent
					side={isMobile ? "top" : "right"}
					sideOffset={12}
					align="end"
					className="w-64 p-0"
				>
					<div className="flex flex-col py-1">
						<ChangelogMegaphoneRow />
						<Link
							to="/user/settings"
							className="hover:bg-accent flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors"
						>
							<SettingsIcon className="size-4" />
							Impostazioni
						</Link>
						<Link
							to="/contact"
							className="hover:bg-accent flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors"
						>
							<LetterIcon className="size-4" />
							Contatti
						</Link>

						<div className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm font-medium">
							<span className="flex items-center gap-3">
								<PaletteIcon className="size-4" />
								Tema
							</span>
							<SegmentedControl
								label="Tema"
								size="sm"
								iconOnly
								className="p-0.5"
								value={mounted ? (theme as "light" | "dark" | "system") : "system"}
								onChange={next => runThemeTransition(() => setTheme(next), null)}
								options={THEME_OPTIONS}
							/>
						</div>
					</div>

					<Separator />

					<div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 py-2.5 text-xs">
						<Link to="/legal/terms" className="hover:text-foreground transition-colors">
							Termini
						</Link>
						<span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
						<Link
							to="/legal/privacy"
							className="hover:text-foreground transition-colors"
						>
							Privacy
						</Link>
						<span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
						<Link
							to="/legal/cookies"
							className="hover:text-foreground transition-colors"
						>
							Cookie
						</Link>
					</div>

					<Separator />

					<div className="p-1">
						<button
							onClick={() => logout.mutate({})}
							className="text-danger hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
						>
							<Logout3Icon className="size-4" />
							Esci
						</button>
					</div>
				</PopoverContent>
			</Popover>
		</SidebarMenuItem>
	);
}

export function AppSidebar() {
	const isAdmin = useIsAdmin();

	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
					<Link
						to="/user"
						aria-label="TriviaMore"
						className="focus-visible:ring-ring focus-visible:shadow-focus flex items-center gap-2.5 rounded-xl px-1 py-1 transition-opacity outline-none group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 hover:opacity-80 focus-visible:ring-2"
					>
						<LogoIcon size={28} className="shrink-0" />
						<span className="truncate text-lg font-semibold group-data-[collapsible=icon]:hidden">
							TriviaMore
						</span>
					</Link>
					<div className="ml-auto flex items-center gap-0.5 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:flex-col">
						<SidebarNotificationBell />
						<SidebarTrigger className="size-8 shrink-0" />
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<NavRow item={HOME_ITEM} />
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<RailDot />

				<SidebarGroup>
					<SidebarGroupLabel>Il mio studio</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{STUDY_ITEMS.map(item => (
								<NavRow key={item.to} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<RailDot />

				<SidebarGroup>
					<SidebarGroupLabel>Catalogo</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{CATALOG_ITEMS.map(item => (
								<NavRow key={item.to} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="mt-auto">
					<RailDot />
					<SidebarGroupContent>
						<SidebarMenu>
							<NavRow item={REQUESTS_ITEM} />
							{isAdmin && <NavRow item={ADMIN_ITEM} />}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<ProfileRow />
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
