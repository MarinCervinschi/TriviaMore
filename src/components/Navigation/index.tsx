"use client";

import { useState } from "react";

import { useSession } from "next-auth/react";

import { AuthenticatedNavigation } from "./AuthenticatedNavigation";
import { GuestNavigation } from "./GuestNavigation";
import { NavLogo } from "./NavLogo";
import { NavigationUser } from "./types";
import { handleUserSignOut } from "./utils";

export function Navigation() {
	const { data: session, status } = useSession();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Transform session user to navigation user interface
	const navigationUser: NavigationUser | null = session?.user
		? {
				name: session.user.name,
				email: session.user.email,
				image: session.user.image,
			}
		: null;

	const onSignOut = () => handleUserSignOut();

	const mobileMenuProps = { mobileMenuOpen, setMobileMenuOpen };

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between py-4">
					<NavLogo />

					{status === "loading" ? (
						<div className="flex items-center gap-4">
							<div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							<div className="h-9 w-9 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							<div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
						</div>
					) : navigationUser ? (
						<AuthenticatedNavigation
							user={navigationUser}
							onSignOut={onSignOut}
							mobileMenuProps={mobileMenuProps}
						/>
					) : (
						<GuestNavigation mobileMenuProps={mobileMenuProps} />
					)}
				</div>
			</div>
		</nav>
	);
}
