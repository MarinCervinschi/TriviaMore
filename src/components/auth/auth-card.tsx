import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/ui/logo";

export function AuthCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<div className="relative flex min-h-screen items-center justify-center px-4 py-12">
			{/* Mesh gradient background */}
			<div className="pointer-events-none fixed inset-0 -z-10">
				<div className="from-primary/8 via-background to-background dark:from-primary/15 dark:via-background dark:to-background absolute inset-0 bg-gradient-to-b" />
				<div className="bg-primary/12 absolute top-1/4 -left-40 h-[500px] w-[500px] animate-pulse rounded-full blur-[120px]" />
				<div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-orange-400/15 blur-[100px] dark:bg-orange-500/10" />
				<div className="absolute bottom-1/4 left-1/3 h-[350px] w-[350px] rounded-full bg-red-300/10 blur-[90px] dark:bg-red-500/8" />
				<div className="dot-pattern absolute inset-0" />
			</div>

			<div className="fixed top-4 right-4 z-10">
				<ThemeToggle className="bg-card/50 backdrop-blur-sm" />
			</div>

			<div className="w-full max-w-md">
				{/* Back link */}
				<div className="mb-6 flex justify-center">
					<Link
						to="/"
						className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
					>
						<ArrowLeftIcon className="h-4 w-4" />
						Torna alla home
					</Link>
				</div>

				{/* Glass card */}
				<div className="bg-card/80 dark:bg-card/60 overflow-hidden rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5">
					{/* Logo + title */}
					<div className="mb-8 text-center">
						<div className="mb-4 flex justify-center">
							<Logo size="lg" />
						</div>
						<h1 className="text-xl font-semibold tracking-tight">{title}</h1>
						<p className="text-muted-foreground mt-1 text-sm">{description}</p>
					</div>

					{children}
				</div>
			</div>
		</div>
	);
}
