import { useRef, useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { Logout3Icon } from "@solar-icons/react/linear/logout-3";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { Link, useMatchRoute } from "@tanstack/react-router";

import { ThemeIcons } from "@/components/layout/theme-toggle";
import { SidebarChangelogMegaphone } from "@/components/notifications/changelog-megaphone";
import { SidebarNotificationBell } from "@/components/notifications/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoIcon } from "@/components/ui/logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

import {
	ABOUT_ITEM,
	ADMIN_ITEM,
	GRAPH_ITEM,
	NAV_ITEMS,
	type NavItem,
	getInitials,
	useIsAdmin,
} from "./nav-items";

const ITEM_BASE =
	"relative flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const ITEM_IDLE = "text-muted-foreground hover:bg-foreground/5 hover:text-foreground";
const ITEM_ACTIVE = "text-primary";

function ActiveBar() {
	return (
		<span className="bg-primary absolute top-2 bottom-2 -left-[14px] w-[3px] rounded-r-full" />
	);
}

function SidebarNavIcon({ item, isActive }: { item: NavItem; isActive: boolean }) {
	const Icon = item.icon;
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link
					to={item.to}
					aria-current={isActive ? "page" : undefined}
					className={cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_IDLE)}
				>
					{isActive && <ActiveBar />}
					<Icon className="size-[18px]" />
				</Link>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={14}>
				{item.label}
			</TooltipContent>
		</Tooltip>
	);
}

function SidebarThemeToggle() {
	const { mounted, toggleTheme } = useTheme();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					onClick={event => toggleTheme(event.nativeEvent)}
					disabled={!mounted}
					aria-label="Cambia tema"
					className={cn(ITEM_BASE, ITEM_IDLE)}
				>
					<ThemeIcons className="size-[18px] [&_svg]:size-[18px]" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={14}>
				Cambia tema
			</TooltipContent>
		</Tooltip>
	);
}

function SidebarSearchHover() {
	const [open, setOpen] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	function handleEnter() {
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
		setOpen(true);
	}

	function handleLeave() {
		closeTimer.current = setTimeout(() => setOpen(false), 200);
	}

	return (
		<div onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="relative">
			<Tooltip>
				<TooltipTrigger asChild>
					<button aria-label="Cerca" className={cn(ITEM_BASE, ITEM_IDLE)}>
						<MagnifierIcon className="size-[18px]" />
					</button>
				</TooltipTrigger>
				{!open && (
					<TooltipContent side="right" sideOffset={14}>
						Cerca
					</TooltipContent>
				)}
			</Tooltip>

			{open && (
				<div
					className="absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2"
					onMouseEnter={handleEnter}
					onMouseLeave={handleLeave}
				>
					<div className="border-border/60 bg-popover text-popover-foreground animate-in fade-in-0 slide-in-from-left-2 flex flex-col gap-1 rounded-2xl border p-1.5 shadow-xl duration-150">
						<Link
							to="/search/courses"
							onClick={() => setOpen(false)}
							className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
						>
							<DiplomaIcon className="h-4 w-4 flex-shrink-0" />
							Cerca corso
						</Link>
						<Link
							to="/search/classes"
							onClick={() => setOpen(false)}
							className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
						>
							<BookIcon className="h-4 w-4 flex-shrink-0" />
							Cerca insegnamento
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

function SidebarProfile({
	user,
	onLogout,
}: {
	user: ReturnType<typeof useAuth>["user"];
	onLogout: () => void;
}) {
	const [open, setOpen] = useState(false);
	const initials = getInitials(user?.name, user?.email);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<button
							aria-label="Menu profilo"
							className="focus-visible:ring-ring flex h-[42px] w-[42px] items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
						>
							<Avatar className="h-8 w-8">
								<AvatarImage
									src={user?.image ?? undefined}
									alt={user?.name ?? "Utente"}
								/>
								<AvatarFallback className="bg-primary/10 text-primary text-2xs font-semibold">
									{initials}
								</AvatarFallback>
							</Avatar>
						</button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={14}>
					Profilo
				</TooltipContent>
			</Tooltip>

			<PopoverContent side="right" sideOffset={16} align="end" className="w-64 p-0">
				<div className="flex items-center gap-3 p-4">
					<Avatar className="h-10 w-10">
						<AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "Utente"} />
						<AvatarFallback className="text-xs font-semibold">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{user?.name ?? "Utente"}</p>
						<p className="text-muted-foreground truncate text-xs">{user?.email}</p>
					</div>
				</div>

				<Separator />

				<div className="flex flex-col py-1">
					<Link
						to="/user/settings"
						onClick={() => setOpen(false)}
						className="hover:bg-accent flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
					>
						<SettingsIcon className="h-4 w-4" />
						Impostazioni
					</Link>
					<Link
						to="/contact"
						onClick={() => setOpen(false)}
						className="hover:bg-accent flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
					>
						<LetterIcon className="h-4 w-4" />
						Contatti
					</Link>
				</div>

				<Separator />

				<div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3 text-xs">
					<Link
						to="/legal/terms"
						onClick={() => setOpen(false)}
						className="hover:text-foreground transition-colors"
					>
						Termini
					</Link>
					<span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
					<Link
						to="/legal/privacy"
						onClick={() => setOpen(false)}
						className="hover:text-foreground transition-colors"
					>
						Privacy
					</Link>
					<span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
					<Link
						to="/legal/cookies"
						onClick={() => setOpen(false)}
						className="hover:text-foreground transition-colors"
					>
						Cookie
					</Link>
				</div>

				<Separator />

				<div className="p-1">
					<button
						onClick={() => {
							setOpen(false);
							onLogout();
						}}
						className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
					>
						<Logout3Icon className="h-4 w-4" />
						Esci
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function GroupDivider() {
	return <Separator className="bg-border my-1 w-[30px]" />;
}

export function LumaSidebar() {
	const isAdmin = useIsAdmin();
	const matchRoute = useMatchRoute();
	const { user, logout } = useAuth();

	const adminActive =
		isAdmin && !!matchRoute({ to: ADMIN_ITEM.to, fuzzy: ADMIN_ITEM.fuzzy });

	return (
		<TooltipProvider delayDuration={300}>
			<aside
				role="navigation"
				aria-label="Navigazione principale"
				className={cn(
					"fixed top-3 bottom-3 left-3 z-50 w-[66px]",
					"hidden flex-col items-center gap-[7px] py-3 md:flex",
					// A floating card *above* the page band, not a window onto it: an opaque
					// surface is what keeps the light from tinting the chrome.
					"border-border/60 bg-background rounded-2xl border",
					"shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
				)}
			>
				{/* Brand */}
				<Link
					to="/user"
					aria-label="TriviaMore home"
					className="focus-visible:ring-ring flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
				>
					<LogoIcon size={26} />
				</Link>

				<GroupDivider />

				{/* Primary nav */}
				{NAV_ITEMS.map(item => (
					<SidebarNavIcon
						key={item.to}
						item={item}
						isActive={!!matchRoute({ to: item.to, fuzzy: item.fuzzy })}
					/>
				))}

				<GroupDivider />

				{/* Tools */}
				<SidebarSearchHover />
				<SidebarNavIcon
					item={GRAPH_ITEM}
					isActive={!!matchRoute({ to: GRAPH_ITEM.to, fuzzy: GRAPH_ITEM.fuzzy })}
				/>
				<SidebarNavIcon
					item={ABOUT_ITEM}
					isActive={!!matchRoute({ to: ABOUT_ITEM.to, fuzzy: ABOUT_ITEM.fuzzy })}
				/>
				{isAdmin && <SidebarNavIcon item={ADMIN_ITEM} isActive={adminActive} />}

				<div className="flex-1" />
				<GroupDivider />

				{/* Utility */}
				<SidebarChangelogMegaphone />
				<SidebarNotificationBell />
				<SidebarThemeToggle />
				<SidebarProfile user={user} onLogout={() => logout.mutate({})} />
			</aside>
		</TooltipProvider>
	);
}
