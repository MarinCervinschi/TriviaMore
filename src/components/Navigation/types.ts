import { User } from "next-auth";

export interface MobileMenuProps {
	mobileMenuOpen: boolean;
	setMobileMenuOpen: (open: boolean) => void;
}

export interface UserAvatarProps {
	user: User;
	size?: "sm" | "md" | "lg";
}

export interface UserMenuProps {
	user: User;
	onSignOut: () => void;
}

export interface GuestNavigationProps {
	mobileMenuProps: MobileMenuProps;
}

export interface AuthenticatedNavigationProps {
	user: User;
	onSignOut: () => void;
	mobileMenuProps: MobileMenuProps;
}

export interface NavLink {
	href: string;
	label: string;
	shortLabel?: string;
	icon?: string;
}
