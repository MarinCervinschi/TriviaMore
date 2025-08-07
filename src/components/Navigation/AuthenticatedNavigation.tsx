import { LogOut, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/Theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
	DesktopNavLink,
	MobileNavLink,
	authenticatedNavLinks,
	userMenuLinks,
} from "./NavLinks";
import { UserAvatar } from "./UserAvatar";
import { UserMenu } from "./UserMenu";
import { AuthenticatedNavigationProps } from "./types";

export function AuthenticatedNavigation({
	user,
	onSignOut,
	mobileMenuProps,
}: AuthenticatedNavigationProps) {
	const { mobileMenuOpen, setMobileMenuOpen } = mobileMenuProps;

	return (
		<>
			{/* Desktop Navigation */}
			<div className="hidden items-center gap-4 md:flex">
				{authenticatedNavLinks.map(item => (
					<DesktopNavLink
						key={item.href}
						item={item}
						showShortLabel={item.shortLabel !== undefined}
					/>
				))}
				<ThemeToggle />
				<UserMenu user={user} onSignOut={onSignOut} />
			</div>

			{/* Mobile Navigation */}
			<div className="flex items-center gap-2 md:hidden">
				<ThemeToggle />
				<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Apri menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[300px] sm:w-[400px]">
						<div className="flex flex-col gap-4 py-4">
							{/* User Info */}
							<div className="flex items-center gap-3 border-b px-2 py-3">
								<UserAvatar user={user} size="lg" />
								<div className="flex flex-col space-y-1">
									{user.name && <p className="font-medium">{user.name}</p>}
									{user.email && (
										<p className="truncate text-sm text-muted-foreground">
											{user.email}
										</p>
									)}
								</div>
							</div>

							{/* Navigation Links */}
							{authenticatedNavLinks.map(item => (
								<MobileNavLink
									key={item.href}
									item={item}
									onClick={() => setMobileMenuOpen(false)}
								/>
							))}

							<hr />

							{/* User Menu Links */}
							{userMenuLinks.map(item => (
								<MobileNavLink
									key={item.href}
									item={item}
									onClick={() => setMobileMenuOpen(false)}
								/>
							))}

							{/* Logout Button */}
							<button
								onClick={() => {
									onSignOut();
									setMobileMenuOpen(false);
								}}
								className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left text-lg font-medium text-red-600 hover:bg-accent"
							>
								<LogOut className="h-5 w-5" />
								Logout
							</button>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
