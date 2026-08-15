import { motion } from "framer-motion";

import { Card, CardTexture } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
	fadeInUp,
	staggerContainer,
	staggerItem,
	withReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

import type { FeatureCard } from "./data";

function FeatureCardComponent({
	feature,
	className,
}: {
	feature: FeatureCard;
	className?: string;
}) {
	const Icon = feature.icon;
	return (
		<Card className={cn("relative overflow-hidden p-6 sm:p-8", className)}>
			<CardTexture placement="tl" alpha={0.12} />
			<div className="relative">
				<div className={`mb-4 inline-flex rounded-2xl p-3 ${feature.iconBg}`}>
					<Icon className={`h-7 w-7 ${feature.iconColor}`} aria-hidden />
				</div>
				<h3 className="mb-2 text-lg font-semibold tracking-tight">{feature.title}</h3>
				<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
			</div>
		</Card>
	);
}

export function FeaturesSection({ features }: { features: FeatureCard[] }) {
	const prefersReduced = useReducedMotion();
	const { ref: headingRef, isVisible: headingVisible } = useScrollReveal();
	const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

	const fadeUp = withReducedMotion(fadeInUp, prefersReduced);
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	return (
		<section className="relative py-20 sm:py-28">
			{/* Background */}
			<div className="bg-muted/30 pointer-events-none absolute inset-0 -z-10" />

			<div className="container">
				<motion.div
					ref={headingRef}
					className="mb-16 text-center"
					variants={fadeUp}
					initial="hidden"
					animate={headingVisible ? "visible" : "hidden"}
				>
					<p className="text-brand eyebrow-lg mb-3">Funzionalità</p>
					<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
						Cosa lo rende diverso
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
						Chi scrive le domande, per quale università, e a quali condizioni si usa.
					</p>
				</motion.div>

				{/* Bento-style grid: 2 large + 2 small */}
				<motion.div
					ref={gridRef}
					className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2"
					variants={container}
					initial="hidden"
					animate={gridVisible ? "visible" : "hidden"}
				>
					{features.map((feature, i) => (
						<motion.div key={feature.title} variants={item}>
							<FeatureCardComponent
								feature={feature}
								className={i < 2 ? "md:min-h-[220px]" : ""}
							/>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
