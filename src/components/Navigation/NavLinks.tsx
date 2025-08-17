"use client";

import type React from "react";

import Link from "next/link";

import {
	BookOpen,
	GraduationCap,
	Home,
	Info,
	Mail,
	Settings,
	User,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface NavLinkItem {
	href: string;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	shortLabel?: string; // Per versioni mobile più compatte
}

// Configurazione centralizzata dei link (Open/Closed Principle)
export const guestNavLinks: NavLinkItem[] = [
	{
		href: "/browse",
		label: "Contenuti",
		icon: BookOpen,
	},
	{
		href: "/about",
		label: "Chi Siamo",
		icon: Info,
	},
	{
		href: "/contact",
		label: "Contatti",
		icon: Mail,
	},
];

export const authenticatedNavLinks: NavLinkItem[] = [
	{
		href: "/user",
		label: "Il Mio Profilo",
		icon: Home,
	},
	{
		href: "/browse",
		label: "Contenuti",
		icon: BookOpen,
	},
	{
		href: "/user/classes",
		label: "I miei Corsi",
		shortLabel: "I miei Corsi",
		icon: GraduationCap,
	},
];

export const userMenuLinks: NavLinkItem[] = [
	{
		href: "/user",
		label: "Il Mio Profilo",
		icon: User,
	},
	{
		href: "/contact",
		label: "Contatti",
		icon: Mail,
	},
	{
		href: "/user/settings",
		label: "Impostazioni",
		icon: Settings,
	},
];

interface DesktopNavLinkProps {
	item: NavLinkItem;
	showShortLabel?: boolean;
}

export function DesktopNavLink({ item, showShortLabel = false }: DesktopNavLinkProps) {
	const { href, label, shortLabel, icon: Icon } = item;
	const displayLabel = showShortLabel && shortLabel ? shortLabel : label;

	return (
		<Link href={href}>
			<Button variant="ghost" className="flex items-center gap-2">
				{Icon && <Icon className="h-4 w-4" />}
				<span className={showShortLabel ? "hidden lg:inline" : ""}>{displayLabel}</span>
				{showShortLabel && shortLabel && (
					<span className="lg:hidden">{shortLabel}</span>
				)}
			</Button>
		</Link>
	);
}

interface MobileNavLinkProps {
	item: NavLinkItem;
	onClick?: () => void;
}

export function MobileNavLink({ item, onClick }: MobileNavLinkProps) {
	const { href, label, icon: Icon } = item;

	return (
		<Link
			href={href}
			onClick={onClick}
			className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
		>
			{Icon && <Icon className="h-5 w-5" />}
			{label}
		</Link>
	);
}
