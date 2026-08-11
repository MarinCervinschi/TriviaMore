import { useEffect } from "react";

import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { HomeIcon } from "@solar-icons/react/linear/home";
import { RestartIcon } from "@solar-icons/react/linear/restart";
import { Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { PageBand } from "@/components/layout/page-band";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { reportBrowserError } from "@/lib/logging/browser";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";

export function ErrorPage({ error }: { error: Error }) {
	const router = useRouter();
	const prefersReduced = useReducedMotion();

	useEffect(() => {
		reportBrowserError("Error boundary rendered", error);
	}, [error]);
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	return (
		<div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
			{/* Background */}
			<PageBand />

			<motion.div
				className="relative flex flex-col items-center"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				{/* Icon with glow */}
				<motion.div className="mb-6" variants={item}>
					<div className="bg-destructive/10 relative inline-flex rounded-3xl p-6">
						<div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_0_30px_hsl(var(--destructive)/0.15)]" />
						<DangerTriangleIcon className="text-danger relative h-12 w-12" />
					</div>
				</motion.div>

				<motion.h1 className="text-2xl font-bold sm:text-3xl" variants={item}>
					Qualcosa è andato storto
				</motion.h1>

				<motion.p className="text-muted-foreground mt-3 max-w-md" variants={item}>
					Si è verificato un errore imprevisto. Riprova o torna alla home.
				</motion.p>

				{/* Dev error message */}
				{import.meta.env.DEV && error.message && (
					<motion.pre
						className="bg-muted/50 text-muted-foreground mt-6 max-w-lg overflow-auto rounded-2xl border p-4 text-left font-mono text-xs"
						variants={item}
					>
						{error.message}
					</motion.pre>
				)}

				{/* Buttons */}
				<motion.div className="mt-10 flex gap-3" variants={item}>
					<Button onClick={() => router.invalidate()}>
						<RestartIcon className="mr-2 h-4 w-4" />
						Riprova
					</Button>
					<Button variant="outline" asChild>
						<Link to="/">
							<HomeIcon className="mr-2 h-4 w-4" />
							Torna alla home
						</Link>
					</Button>
				</motion.div>
			</motion.div>
		</div>
	);
}
