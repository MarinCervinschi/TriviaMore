"use client";

import { useState } from "react";

import { User } from "next-auth";

import { AuthenticatedNavigation } from "./AuthenticatedNavigation";
import { GuestNavigation } from "./GuestNavigation";
import { NavLogo } from "./NavLogo";
import { handleUserSignOut } from "./utils";

export function Navigation({ user }: { user: User | null }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const onSignOut = () => handleUserSignOut();

	const mobileMenuProps = { mobileMenuOpen, setMobileMenuOpen };

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between py-4">
					<NavLogo />

					{user ? (
						<AuthenticatedNavigation
							user={user}
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
