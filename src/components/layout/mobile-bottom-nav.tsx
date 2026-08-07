import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Bell,
	BookOpen,
	GraduationCap,
	Info,
	LogOut,
	Mail,
	Megaphone,
	Settings,
	Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { changelogQueries } from "@/lib/changelogs/queries";
import { springGentle, springSnappy, withReducedMotion } from "@/lib/motion";
import { notificationQueries } from "@/lib/notifications/queries";
import { cn } from "@/lib/utils";

import {
	ABOUT_ITEM,
	ADMIN_ITEM,
	NAV_ITEMS,
	type NavItem,
	getInitials,
	useIsAdmin,
} from "./nav-items";
import { ThemeToggle } from "./theme-toggle";

const ENTRANCE_VARIANTS = {
	hidden: { y: 80, opacity: 0 },
	visible: { y: 0, opacity: 1, transition: springGentle },
};

function BottomNavItem({
	item,
	isActive,
	prefersReduced,
}: {
	item: NavItem;
	isActive: boolean;
	prefersReduced: boolean;
}) {
	const Icon = item.icon;
	return (
		<li className="flex flex-1">
			<Link
				to={item.to}
				aria-current={isActive ? "page" : undefined}
				aria-label={item.label}
				className={cn(
					"relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5",
					"transition-colors focus-visible:outline-none active:scale-[0.96]",
					"focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
					isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
				)}
			>
				{isActive && (
					<motion.span
						layoutId="bottom-nav-active"
						className="bg-primary absolute top-0 h-[3px] w-8 rounded-b-full"
						transition={prefersReduced ? { duration: 0 } : springSnappy}
					/>
				)}
				<Icon className="size-[22px]" strokeWidth={1.5} aria-hidden />
				<span className="text-[10px] leading-none font-medium">{item.label}</span>
			</Link>
		</li>
	);
}

function ToolTile({
	to,
	icon: Icon,
	label,
	badge,
	onClose,
	external,
}: {
	to: string;
	icon: LucideIcon;
	label: string;
	badge?: number;
	onClose: () => void;
	external?: { variant: "admin" };
}) {
	return (
		<Link
			to={to}
			onClick={onClose}
			className={cn(
				"bg-card hover:bg-accent relative flex items-center gap-3 rounded-xl border p-3 transition-colors",
				external?.variant === "admin" &&
					"border-primary/30 bg-primary/5 hover:bg-primary/10"
			)}
		>
			<span
				className={cn(
					"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
					external?.variant === "admin"
						? "bg-primary/15 text-primary"
						: "bg-muted text-foreground"
				)}
			>
				<Icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
			</span>
			<span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
			{external?.variant === "admin" && (
				<span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
					Admin
				</span>
			)}
			{typeof badge === "number" && badge > 0 && (
				<span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
					{badge > 99 ? "99+" : badge}
				</span>
			)}
		</Link>
	);
}

function ProfileSheet({
	open,
	onOpenChange,
	user,
	onLogout,
	isAdmin,
	unreadNotifications,
	unreadChangelogs,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: ReturnType<typeof useAuth>["user"];
	onLogout: () => void;
	isAdmin: boolean;
	unreadNotifications: number;
	unreadChangelogs: number;
}) {
	const initials = getInitials(user?.name, user?.email);
	const close = () => onOpenChange(false);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				className="bg-background/95 max-h-[85vh] overflow-y-auto rounded-t-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-xl"
			>
				{/* Grab handle */}
				<div
					aria-hidden
					className="bg-muted-foreground/30 mx-auto mb-3 h-1 w-9 rounded-full"
				/>

				{/* User card */}
				<div className="bg-muted/50 mb-4 flex items-center gap-3 rounded-2xl p-3">
					<Avatar className="h-12 w-12">
						<AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "Utente"} />
						<AvatarFallback className="text-sm font-semibold">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold">{user?.name ?? "Utente"}</p>
						<p className="text-muted-foreground truncate text-xs">{user?.email}</p>
					</div>
				</div>

				{/* Tools */}
				<p className="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
					Strumenti
				</p>
				<div className="grid grid-cols-2 gap-2">
					<ToolTile
						to="/user/notifications"
						icon={Bell}
						label="Notifiche"
						badge={unreadNotifications}
						onClose={close}
					/>
					<ToolTile
						to="/news"
						icon={Megaphone}
						label="Novità"
						badge={unreadChangelogs}
						onClose={close}
					/>
					<ToolTile
						to="/search/courses"
						icon={GraduationCap}
						label="Cerca Corsi"
						onClose={close}
					/>
					<ToolTile
						to="/search/classes"
						icon={BookOpen}
						label="Cerca Insegn."
						onClose={close}
					/>
					<ToolTile
						to={ABOUT_ITEM.to}
						icon={Info}
						label={ABOUT_ITEM.label}
						onClose={close}
					/>
					{isAdmin && (
						<ToolTile
							to={ADMIN_ITEM.to}
							icon={Shield}
							label={ADMIN_ITEM.label}
							external={{ variant: "admin" }}
							onClose={close}
						/>
					)}
				</div>

				<Separator className="my-4" />

				{/* Account */}
				<p className="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
					Account
				</p>
				<div className="flex flex-col gap-1">
					<Link
						to="/user/settings"
						onClick={close}
						className="hover:bg-accent flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
					>
						<Settings className="size-4" strokeWidth={1.5} aria-hidden />
						Impostazioni
					</Link>
					<Link
						to="/contact"
						onClick={close}
						className="hover:bg-accent flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
					>
						<Mail className="size-4" strokeWidth={1.5} aria-hidden />
						Contatti
					</Link>
				</div>

				<Separator className="my-4" />

				{/* Theme */}
				<div className="bg-muted/30 flex items-center justify-between rounded-xl px-3 py-2">
					<span className="text-muted-foreground text-sm font-medium">Tema</span>
					<ThemeToggle />
				</div>

				<Separator className="my-4" />

				{/* Legal footer */}
				<div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 pb-3 text-xs">
					<Link
						to="/legal/terms"
						onClick={close}
						className="hover:text-foreground transition-colors"
					>
						Termini
					</Link>
					<span aria-hidden className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
					<Link
						to="/legal/privacy"
						onClick={close}
						className="hover:text-foreground transition-colors"
					>
						Privacy
					</Link>
					<span aria-hidden className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
					<Link
						to="/legal/cookies"
						onClick={close}
						className="hover:text-foreground transition-colors"
					>
						Cookie
					</Link>
				</div>

				{/* Logout */}
				<button
					type="button"
					onClick={() => {
						close();
						onLogout();
					}}
					className="border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors"
				>
					<LogOut className="size-4" strokeWidth={1.5} aria-hidden />
					Esci
				</button>
			</SheetContent>
		</Sheet>
	);
}

export function MobileBottomNav() {
	const matchRoute = useMatchRoute();
	const { user, logout } = useAuth();
	const isAdmin = useIsAdmin();
	const prefersReduced = useReducedMotion();
	const variants = withReducedMotion(ENTRANCE_VARIANTS, prefersReduced);
	const [profileOpen, setProfileOpen] = useState(false);

	const { data: unreadNotifications = 0 } = useQuery(notificationQueries.unreadCount());
	const { data: unreadVersions = [] } = useQuery(changelogQueries.unreadVersions());
	const unreadChangelogs = unreadVersions.length;
	const totalUnread = unreadNotifications + unreadChangelogs;

	const initials = getInitials(user?.name, user?.email);
	const profileActive = profileOpen;

	return (
		<motion.nav
			role="navigation"
			aria-label="Navigazione principale"
			variants={variants}
			initial="hidden"
			animate="visible"
			className={cn(
				"fixed inset-x-0 bottom-0 z-50 md:hidden",
				"border-border/60 bg-background/95 border-t backdrop-blur-xl",
				"shadow-[0_-4px_24px_rgba(0,0,0,0.06)]",
				"pb-[env(safe-area-inset-bottom)]"
			)}
		>
			<ul className="flex items-stretch justify-around px-1">
				{NAV_ITEMS.map(item => (
					<BottomNavItem
						key={item.to}
						item={item}
						isActive={!!matchRoute({ to: item.to, fuzzy: item.fuzzy })}
						prefersReduced={prefersReduced}
					/>
				))}
				<li className="flex flex-1">
					<Sheet open={profileOpen} onOpenChange={setProfileOpen}>
						<SheetTrigger asChild>
							<button
								type="button"
								aria-label="Apri menu profilo"
								aria-haspopup="dialog"
								aria-expanded={profileOpen}
								className={cn(
									"relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5",
									"transition-colors focus-visible:outline-none active:scale-[0.96]",
									"focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
									profileActive
										? "text-primary"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{profileActive && (
									<motion.span
										layoutId="bottom-nav-active"
										className="bg-primary absolute top-0 h-[3px] w-8 rounded-b-full"
										transition={prefersReduced ? { duration: 0 } : springSnappy}
									/>
								)}
								<span className="relative">
									<Avatar className="size-[26px]">
										<AvatarImage
											src={user?.image ?? undefined}
											alt={user?.name ?? "Utente"}
										/>
										<AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
											{initials}
										</AvatarFallback>
									</Avatar>
									{totalUnread > 0 && (
										<span
											aria-hidden
											className="bg-primary ring-background absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2"
										/>
									)}
								</span>
								<span className="text-[10px] leading-none font-medium">Profilo</span>
							</button>
						</SheetTrigger>
						<ProfileSheet
							open={profileOpen}
							onOpenChange={setProfileOpen}
							user={user}
							onLogout={() => logout.mutate({})}
							isAdmin={isAdmin}
							unreadNotifications={unreadNotifications}
							unreadChangelogs={unreadChangelogs}
						/>
					</Sheet>
				</li>
			</ul>
		</motion.nav>
	);
}
