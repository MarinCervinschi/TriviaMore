import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";

import type { HeroContent } from "./data";

export function HeroSection({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	title: _title,
	subtitle,
	primaryCTA,
	secondaryCTA,
}: HeroContent) {
	const prefersReduced = useReducedMotion();
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	return (
		<section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
			{/* Mesh gradient background */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				{/* Base warm tone */}
				<div className="via-background to-background dark:via-background dark:to-background absolute inset-0 bg-gradient-to-b from-orange-50/80 dark:from-orange-950/20" />
				{/* Animated orbs */}
				<motion.div
					className="bg-primary/10 absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full blur-[100px]"
					animate={prefersReduced ? undefined : { x: [0, 20, 0], y: [0, -15, 0] }}
					transition={
						prefersReduced
							? undefined
							: { duration: 10, repeat: Infinity, ease: "easeInOut" }
					}
				/>
				<motion.div
					className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-orange-300/15 blur-[100px] dark:bg-orange-500/10"
					animate={prefersReduced ? undefined : { x: [0, -18, 0], y: [0, 12, 0] }}
					transition={
						prefersReduced
							? undefined
							: { duration: 12, repeat: Infinity, ease: "easeInOut" }
					}
				/>
				<motion.div
					className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-red-300/10 blur-[80px] dark:bg-red-500/8"
					animate={prefersReduced ? undefined : { x: [0, 10, 0], y: [0, -8, 0] }}
					transition={
						prefersReduced
							? undefined
							: { duration: 8, repeat: Infinity, ease: "easeInOut" }
					}
				/>
				{/* Dot grid overlay */}
				<div className="dot-pattern absolute inset-0" />
			</div>

			<motion.div
				className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				{/* Badge */}
				<motion.div
					className="border-primary/20 bg-primary/5 text-primary mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
					variants={item}
				>
					<StarsIcon className="h-4 w-4" />
					<span>Open Source &bull; Gratuito &bull; Per studenti</span>
				</motion.div>

				<motion.h1
					className="font-display mx-auto mb-8 max-w-4xl text-4xl leading-[1.1] font-normal tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
					variants={item}
				>
					<span className="gradient-text">Studia meglio,</span>
					<br />
					supera gli esami
				</motion.h1>

				<motion.p
					className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed sm:text-xl"
					variants={item}
				>
					{subtitle}
				</motion.p>

				<motion.div
					className="flex flex-col items-center justify-center gap-4 sm:flex-row"
					variants={item}
				>
					<Button
						size="lg"
						className="shadow-primary/25 h-13 px-6 text-base shadow-lg sm:px-8"
						asChild
					>
						<Link to={primaryCTA.href}>
							{primaryCTA.text}
							<ArrowRightIcon className="ml-2 h-5 w-5" />
						</Link>
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="h-13 px-6 text-base backdrop-blur-sm sm:px-8"
						asChild
					>
						<Link to={secondaryCTA.href}>{secondaryCTA.text}</Link>
					</Button>
				</motion.div>

				{/* Stats row */}
				<motion.div
					className="text-muted-foreground mt-16 flex flex-wrap items-center justify-center gap-8 text-sm sm:gap-12"
					variants={item}
				>
					<div className="flex flex-col items-center">
						<span className="text-foreground text-2xl font-bold">100%</span>
						<span>Gratuito</span>
					</div>
					<div className="bg-border h-8 w-px" />
					<div className="flex flex-col items-center">
						<span className="text-foreground text-2xl font-bold">Open</span>
						<span>Source</span>
					</div>
					<div className="bg-border h-8 w-px" />
					<div className="flex flex-col items-center">
						<span className="text-foreground text-2xl font-bold">UNIMORE</span>
						<span>Focalizzato</span>
					</div>
				</motion.div>
			</motion.div>
		</section>
	);
}
