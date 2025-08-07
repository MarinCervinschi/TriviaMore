/**
 * Navigation Type Definitions
 *
 * Following Interface Segregation Principle:
 * - Minimal interfaces focused on specific navigation needs
 * - NavigationUser contains only display-relevant user properties
 * - Props interfaces define only necessary data for each component
 */

export interface NavigationUser {
	name?: string | null;
	email?: string | null;
	image?: string | null;
}

export interface MobileMenuProps {
	mobileMenuOpen: boolean;
	setMobileMenuOpen: (open: boolean) => void;
}

export interface UserAvatarProps {
	user: NavigationUser;
	size?: "sm" | "md" | "lg";
}

export interface UserMenuProps {
	user: NavigationUser;
	onSignOut: () => void;
}

export interface GuestNavigationProps {
	mobileMenuProps: MobileMenuProps;
}

export interface AuthenticatedNavigationProps {
	user: NavigationUser;
	onSignOut: () => void;
	mobileMenuProps: MobileMenuProps;
}

export interface NavLink {
	href: string;
	label: string;
	shortLabel?: string;
	icon?: string;
}
