import type { LucideIcon } from "lucide-react";

export interface FeatureCard {
	icon: LucideIcon;
	title: string;
	description: string;
	iconColor: string;
}

export interface BenefitItem {
	title: string;
	description: string;
}

export interface FooterSection {
	title: string;
	links: FooterLink[];
}

export interface FooterLink {
	href: string;
	label: string;
}

export interface CTACardProps {
	title: string;
	description: string;
	buttonText: string;
	buttonHref: string;
	secondaryButtonText?: string;
	secondaryButtonHref?: string;
	disclaimer?: string;
}

export interface HeroSectionProps {
	title: string;
	subtitle: string;
	primaryCTA: {
		text: string;
		href: string;
	};
	secondaryCTA: {
		text: string;
		href: string;
	};
}
