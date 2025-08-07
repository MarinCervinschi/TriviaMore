"use client";

import { MinimalFooter } from "@/components/MinimalFooter";
import { Navigation } from "@/components/Navigation";

interface AppLayoutProps {
	children: React.ReactNode;
	showFooter?: boolean;
}

export function AppLayout({ children, showFooter = true }: AppLayoutProps) {
	return (
		<div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			{/* Background decoration - Gradient orbs for modern look */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10"></div>
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"></div>
			</div>

			{/* Content with relative positioning to stay above background */}
			<div className="relative z-10">
				<Navigation />
				<main className="flex-1">{children}</main>
				{showFooter && <MinimalFooter />}
			</div>
		</div>
	);
}
