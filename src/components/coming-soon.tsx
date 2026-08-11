import { RocketIcon } from "@solar-icons/react/linear/rocket";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { motion } from "framer-motion";

import { GithubIcon } from "@/components/icons";
import { PageBand } from "@/components/layout/page-band";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";

export function ComingSoon() {
	const prefersReduced = useReducedMotion();
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden">
			{/* Mesh gradient background */}
			<PageBand />

			<motion.div
				className="mx-auto max-w-2xl px-4 text-center"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				{/* Logo */}
				<motion.div className="mb-10 flex justify-center" variants={item}>
					<Logo size="lg" />
				</motion.div>

				{/* Badge */}
				<motion.div
					className="border-primary/20 bg-primary/5 text-primary mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
					variants={item}
				>
					<RocketIcon className="h-4 w-4" />
					<span>Versione 3.0 in arrivo</span>
				</motion.div>

				{/* Heading */}
				<motion.h1
					className="mb-6 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl md:text-6xl"
					variants={item}
				>
					<span className="gradient-text">Stiamo costruendo</span>
					<br />
					qualcosa di nuovo
				</motion.h1>

				{/* Description */}
				<motion.p
					className="text-muted-foreground mb-10 text-lg leading-relaxed sm:text-xl"
					variants={item}
				>
					TriviaMore sta per tornare, completamente rinnovato.
					<br className="hidden sm:block" />
					Nuova piattaforma, stessa missione: aiutarti a studiare meglio.
				</motion.p>

				{/* Features preview */}
				<motion.div
					className="mb-10 flex flex-wrap items-center justify-center gap-3"
					variants={item}
				>
					{["Quiz migliorati", "Flashcard", "Nuova UI", "Open Source"].map(feature => (
						<span
							key={feature}
							className="border-border/50 bg-card/50 text-muted-foreground rounded-full border px-3 py-1 text-sm backdrop-blur-sm"
						>
							<StarsIcon className="text-primary mr-1 inline h-3 w-3" />
							{feature}
						</span>
					))}
				</motion.div>

				{/* GitHub link */}
				<motion.div variants={item}>
					<Button
						variant="outline"
						className="h-12 px-6 text-base backdrop-blur-sm"
						asChild
					>
						<a
							href="https://github.com/MarinCervinschi/TriviaMore"
							target="_blank"
							rel="noopener noreferrer"
						>
							<GithubIcon className="mr-2 h-5 w-5" />
							Seguici su GitHub
						</a>
					</Button>
				</motion.div>
			</motion.div>
		</div>
	);
}
