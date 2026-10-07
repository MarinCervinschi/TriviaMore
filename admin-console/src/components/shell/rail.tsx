import { Logout2Icon } from "@solar-icons/react/linear/logout-2";
import { UserCircleIcon } from "@solar-icons/react/linear/user-circle";
import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoIcon } from "@/components/ui/logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useSignOut } from "~/lib/auth/use-sign-out";
import { NAV, type NavSection } from "~/lib/nav";

const RAIL_ITEM =
	"focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none";

/** The always-collapsed column of sections; a section's name shows on hover. */
export function Rail({ active, email }: { active: NavSection; email: string | null }) {
	return (
		<aside className="hidden w-16 shrink-0 flex-col items-center gap-3 py-3 md:flex">
			<Link
				to="/"
				aria-label="TriviaMore Console, panoramica"
				className={cn(RAIL_ITEM, "hover:opacity-80")}
			>
				<LogoIcon size={26} />
			</Link>

			<nav aria-label="Sezioni" className="flex flex-1 flex-col items-center gap-1">
				{NAV.map(section => {
					const current = section.id === active.id;
					return (
						<Tooltip key={section.id}>
							<TooltipTrigger asChild>
								<Link
									to={section.groups[0]!.items[0]!.to}
									aria-label={section.label}
									aria-current={current ? "page" : undefined}
									data-active={current}
									className={cn(
										RAIL_ITEM,
										"text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
										"data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
									)}
								>
									<section.icon className="size-[18px]" />
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right">{section.label}</TooltipContent>
						</Tooltip>
					);
				})}
			</nav>

			<div className="flex flex-col items-center gap-1">
				<ThemeToggle className="text-sidebar-foreground/70 size-9" />
				<AccountMenu email={email} />
			</div>
		</aside>
	);
}

function AccountMenu({ email }: { email: string | null }) {
	const signOut = useSignOut();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" aria-label="Account" className={RAIL_ITEM}>
					<Avatar className="size-7">
						<AvatarFallback>
							<UserCircleIcon className="text-sidebar-foreground/70 size-4" />
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="right" align="end" className="w-48">
				<DropdownMenuLabel className="font-normal">
					<span className="block text-xs font-medium">Proprietario della console</span>
					{email && (
						<span className="text-muted-foreground block truncate text-xs">
							{email}
						</span>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => void signOut()}>
					<Logout2Icon className="size-4" />
					Esci
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
