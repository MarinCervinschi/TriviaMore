"use client";

import { MinimalFooter } from "@/components/MinimalFooter";
import { Navigation } from "@/components/Navigation";

interface AppLayoutProps {
	children: React.ReactNode;
	showFooter?: boolean;
}

export function AppLayout({ children, showFooter = true }: AppLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<main className="flex-1">{children}</main>
			{showFooter && <MinimalFooter />}
		</div>
	);
}
