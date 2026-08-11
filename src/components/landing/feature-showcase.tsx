import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
	slideInLeft,
	slideInRight,
	staggerContainer,
	staggerItem,
	withReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

import type { ShowcaseFeature } from "./data";

// TODO: Replace placeholders with real <img src="/screenshots/..." /> once screenshots are captured
function ScreenshotPlaceholder({ feature }: { feature: ShowcaseFeature }) {
	return (
		<div className="bg-card h-full w-full rounded-2xl border p-4 shadow-inner">
			{/* Window chrome */}
			<div className="mb-3 flex items-center gap-1.5">
				<div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
				<div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
				<div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
				<div className="bg-muted ml-2 h-4 w-32 rounded-md" />
			</div>

			{/* Content based on feature type */}
			{feature.id === "quiz" && <QuizMockup />}
			{/* TODO: replace with real screenshot when ready */}
			{/* {feature.id === "dashboard" && (
        <img
          src="/screenshots/dashboard.png"
          alt="Dashboard utente"
          className="w-full rounded-xl"
          loading="lazy"
        />
      )} */}
			{feature.id === "dashboard" && <DashboardMockup />}
			{feature.id === "flashcards" && <FlashcardMockup />}
			{feature.id === "progress" && <ProgressMockup />}
		</div>
	);
}

function QuizMockup() {
	return (
		<div className="space-y-3">
			{/* Timer bar */}
			<div className="flex items-center justify-between">
				<div className="bg-muted h-3 w-20 rounded-full" />
				<div className="bg-muted mx-4 h-2 flex-1 overflow-hidden rounded-full">
					<div className="gradient-bg h-full w-3/5 rounded-full" />
				</div>
				<div className="bg-primary/20 h-3 w-12 rounded-full" />
			</div>
			{/* Question */}
			<div className="bg-background rounded-xl border p-3">
				<div className="bg-muted mb-2 h-3 w-3/4 rounded" />
				<div className="bg-muted h-3 w-1/2 rounded" />
			</div>
			{/* Answer options */}
			<div className="grid grid-cols-1 gap-2">
				{[false, true, false, false].map((active, i) => (
					<div
						key={i}
						className={cn(
							"rounded-xl border p-2.5 transition-colors",
							active ? "border-primary bg-primary/10" : "bg-background"
						)}
					>
						<div
							className={cn(
								"h-2.5 rounded",
								active ? "bg-primary/40 w-2/3" : "bg-muted w-3/5"
							)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function DashboardMockup() {
	return (
		<div className="space-y-3">
			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-2">
				{[
					"bg-blue-500/10",
					"bg-green-500/10",
					"bg-purple-500/10",
					"bg-orange-500/10",
				].map((bg, i) => (
					<div key={i} className={cn("rounded-xl border p-3", bg)}>
						<div className="bg-muted mb-1.5 h-2 w-8 rounded" />
						<div className="bg-foreground/20 h-4 w-12 rounded" />
					</div>
				))}
			</div>
			{/* Recent activity */}
			<div className="bg-background rounded-xl border p-3">
				<div className="bg-muted mb-2 h-2.5 w-24 rounded" />
				{[0.8, 0.6, 0.7].map((w, i) => (
					<div key={i} className="mb-1.5 flex items-center gap-2">
						<div className="bg-muted h-6 w-6 rounded-full" />
						<div className="h-2" style={{ width: `${w * 100}%` }}>
							<div className="bg-muted h-full rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function FlashcardMockup() {
	return (
		<div className="flex flex-col items-center space-y-3">
			{/* Progress */}
			<div className="flex w-full items-center gap-2">
				<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
					<div className="gradient-bg h-full w-2/5 rounded-full" />
				</div>
				<div className="bg-muted h-3 w-16 rounded" />
			</div>
			{/* Flashcard */}
			<div className="border-primary/20 from-primary/5 to-card w-full rounded-2xl border-2 bg-gradient-to-br p-6 text-center">
				<div className="bg-muted mx-auto mb-3 h-3 w-3/4 rounded" />
				<div className="bg-muted mx-auto mb-4 h-3 w-1/2 rounded" />
				<div className="bg-primary/15 mx-auto h-6 w-24 rounded-lg" />
			</div>
			{/* Nav buttons */}
			<div className="flex gap-2">
				<div className="bg-muted h-8 w-20 rounded-xl" />
				<div className="bg-primary/20 h-8 w-20 rounded-xl" />
			</div>
		</div>
	);
}

function ProgressMockup() {
	return (
		<div className="space-y-3">
			{/* Chart area */}
			<div className="bg-background rounded-xl border p-3">
				<div className="bg-muted mb-2 h-2.5 w-20 rounded" />
				<div className="flex h-20 items-end gap-1.5">
					{[0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.75].map((h, i) => (
						<div
							key={i}
							className="bg-primary/30 flex-1 rounded-t"
							style={{ height: `${h * 100}%` }}
						/>
					))}
				</div>
			</div>
			{/* Stats row */}
			<div className="grid grid-cols-3 gap-2">
				{["bg-green-500/10", "bg-blue-500/10", "bg-orange-500/10"].map((bg, i) => (
					<div key={i} className={cn("rounded-xl border p-2 text-center", bg)}>
						<div className="bg-foreground/20 mx-auto mb-1 h-3 w-8 rounded" />
						<div className="bg-muted mx-auto h-2 w-12 rounded" />
					</div>
				))}
			</div>
		</div>
	);
}

function ShowcaseRow({ feature, index }: { feature: ShowcaseFeature; index: number }) {
	const isReversed = index % 2 !== 0;
	const prefersReduced = useReducedMotion();
	const { ref, isVisible } = useScrollReveal();

	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);
	const slideVariant = withReducedMotion(
		isReversed ? slideInLeft : slideInRight,
		prefersReduced
	);

	const Icon = feature.icon;

	return (
		<motion.div
			ref={ref}
			className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16"
			initial="hidden"
			animate={isVisible ? "visible" : "hidden"}
		>
			{/* Text side */}
			<motion.div className={isReversed ? "lg:order-2" : ""} variants={container}>
				<motion.div
					className={cn("mb-4 inline-flex rounded-2xl p-3", feature.iconBg)}
					variants={item}
				>
					<Icon className={cn("h-7 w-7", feature.iconColor)} />
				</motion.div>

				<motion.h3
					className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
					variants={item}
				>
					{feature.title}
				</motion.h3>

				<motion.p
					className="text-muted-foreground mb-6 text-lg leading-relaxed"
					variants={item}
				>
					{feature.description}
				</motion.p>

				<motion.ul className="space-y-3" variants={item}>
					{feature.highlights.map(highlight => (
						<li key={highlight} className="flex items-start gap-3">
							<CheckCircleIcon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
							<span className="text-muted-foreground">{highlight}</span>
						</li>
					))}
				</motion.ul>
			</motion.div>

			{/* Screenshot side with 3D perspective */}
			<motion.div className={isReversed ? "lg:order-1" : ""} variants={slideVariant}>
				<div className="[perspective:1200px]">
					<div
						className="transition-transform duration-500 hover:[transform:rotateY(0deg)_rotateX(0deg)]"
						style={{
							transform: isReversed
								? "rotateY(6deg) rotateX(3deg)"
								: "rotateY(-6deg) rotateX(3deg)",
						}}
					>
						<div className="relative overflow-hidden rounded-2xl border shadow-2xl">
							<ScreenshotPlaceholder feature={feature} />
							{/* Gradient overlay for depth */}
							<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

export function FeatureShowcase({ features }: { features: ShowcaseFeature[] }) {
	const prefersReduced = useReducedMotion();
	const { ref: headingRef, isVisible: headingVisible } = useScrollReveal();
	const headingItem = withReducedMotion(staggerItem, prefersReduced);
	const headingContainer = withReducedMotion(staggerContainer, prefersReduced);

	return (
		<section className="relative overflow-hidden py-20 sm:py-28">
			{/* Background */}
			<div className="bg-muted/20 pointer-events-none absolute inset-0 -z-10" />

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section heading */}
				<motion.div
					ref={headingRef}
					className="mb-20 text-center"
					variants={headingContainer}
					initial="hidden"
					animate={headingVisible ? "visible" : "hidden"}
				>
					<motion.p className="text-primary eyebrow-lg mb-3" variants={headingItem}>
						Funzionalita'
					</motion.p>
					<motion.h2
						className="font-display mb-4 text-3xl font-normal tracking-tight sm:text-4xl"
						variants={headingItem}
					>
						Scopri cosa puoi fare con <span className="gradient-text">TriviaMore</span>
					</motion.h2>
					<motion.p
						className="text-muted-foreground mx-auto max-w-2xl text-lg"
						variants={headingItem}
					>
						Strumenti pensati per uno studio efficace e una preparazione ottimale agli
						esami.
					</motion.p>
				</motion.div>

				{/* Alternating feature rows */}
				<div className="space-y-20 lg:space-y-28">
					{features.map((feature, i) => (
						<ShowcaseRow key={feature.id} feature={feature} index={i} />
					))}
				</div>
			</div>
		</section>
	);
}
