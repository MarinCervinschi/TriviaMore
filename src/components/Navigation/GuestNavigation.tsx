import Link from "next/link";

import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/Theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { DesktopNavLink, MobileNavLink, guestNavLinks } from "./NavLinks";
import { GuestNavigationProps } from "./types";

export function GuestNavigation({ mobileMenuProps }: GuestNavigationProps) {
	const { mobileMenuOpen, setMobileMenuOpen } = mobileMenuProps;

	return (
		<>
			{/* Desktop Navigation */}
			<div className="hidden items-center gap-4 md:flex">
				{guestNavLinks.map(item => (
					<DesktopNavLink key={item.href} item={item} />
				))}
				<ThemeToggle />
				<Link href="/auth/login">
					<Button variant="outline">Login</Button>
				</Link>
				<Link href="/auth/register">
					<Button>Get Started</Button>
				</Link>
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
							{guestNavLinks.map(item => (
								<MobileNavLink
									key={item.href}
									item={item}
									onClick={() => setMobileMenuOpen(false)}
								/>
							))}
							<hr />
							<Link
								href="/auth/login"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
							>
								Login
							</Link>
							<Link
								href="/auth/register"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2 rounded-md px-2 py-3 text-lg font-medium text-blue-600 hover:bg-accent"
							>
								Get Started
							</Link>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
