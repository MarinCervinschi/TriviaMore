import React from "react";

import { SimpleThemeToggle } from "@/components/Theme/simple-theme-toggle";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
	return (
		<div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			{/* Theme Toggle - Fixed position in top right corner */}
			<div className="fixed right-4 top-4 z-10">
				<SimpleThemeToggle />
			</div>

			{/* Main content */}
			<div className="w-full max-w-md">{children}</div>

			{/* Background decoration - Optional gradient orbs for modern look */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10"></div>
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"></div>
			</div>
		</div>
	);
};
