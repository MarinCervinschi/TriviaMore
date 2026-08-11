import { motion } from "framer-motion";

import {
	CONTENT_LEVELS,
	ContentHierarchyDiagram,
} from "@/components/shared/content-hierarchy-diagram";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { fadeInUp, withReducedMotion } from "@/lib/motion";

export function ContentExplorer() {
	const prefersReduced = useReducedMotion();
	const { ref: headingRef, isVisible: headingVisible } = useScrollReveal();

	const fadeUp = withReducedMotion(fadeInUp, prefersReduced);

	return (
		<section className="relative py-20 sm:py-28">
			<div className="bg-muted/30 pointer-events-none absolute inset-0 -z-10" />

			<div className="container">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Left — heading */}
					<motion.div
						ref={headingRef}
						variants={fadeUp}
						initial="hidden"
						animate={headingVisible ? "visible" : "hidden"}
					>
						<p className="text-brand eyebrow-lg mb-3">Come funziona</p>
						<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							Contenuti organizzati come il tuo piano di studi
						</h2>
						<p className="text-muted-foreground mb-6 text-lg leading-relaxed">
							Ogni contenuto segue la struttura accademica UNIMORE: dal dipartimento
							fino alla sezione su cui esercitarti con quiz e flashcard.
						</p>
						<div className="text-muted-foreground space-y-3 text-sm">
							{CONTENT_LEVELS.map(level => {
								const Icon = level.icon;
								return (
									<div key={level.label} className="flex items-center gap-2.5">
										<div className={`rounded-lg p-1.5 ${level.bg}`}>
											<Icon className={`h-3.5 w-3.5 ${level.color}`} aria-hidden />
										</div>
										<span>
											<span className="text-foreground font-medium">{level.label}</span>
											{" — "}
											{level.description}
										</span>
									</div>
								);
							})}
						</div>
					</motion.div>

					{/* Right — visual tree diagram */}
					<ContentHierarchyDiagram />
				</div>
			</div>
		</section>
	);
}
