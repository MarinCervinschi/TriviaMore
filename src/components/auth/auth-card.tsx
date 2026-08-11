import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { Link } from "@tanstack/react-router";

import { PageBand } from "@/components/layout/page-band";
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
			<PageBand level="public" />

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
