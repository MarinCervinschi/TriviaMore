import { useEffect, useRef, useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { motion } from "framer-motion";

import type { Icon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { PlatformStats } from "@/lib/browse/types";
import {
	fadeInUp,
	staggerContainer,
	staggerItem,
	withReducedMotion,
} from "@/lib/motion";
import { formatNumber } from "@/lib/utils/format";

function useAnimatedCounter(
	target: number,
	isVisible: boolean,
	prefersReduced: boolean,
	duration = 2000
) {
	const [count, setCount] = useState(0);
	const hasAnimated = useRef(false);

	useEffect(() => {
		if (!isVisible || hasAnimated.current || target === 0) return;
		hasAnimated.current = true;

		if (prefersReduced) {
			setCount(target);
			return;
		}

		const startTime = performance.now();
		let raf: number;

		const animate = (now: number) => {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setCount(Math.round(eased * target));

			if (progress < 1) {
				raf = requestAnimationFrame(animate);
			}
		};

		raf = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(raf);
	}, [isVisible, target, prefersReduced, duration]);

	return count;
}

interface StatItemProps {
	icon: Icon;
	value: number;
	label: string;
	color: string;
	bg: string;
	isVisible: boolean;
	prefersReduced: boolean;
}

function StatItem({
	icon: Icon,
	value,
	label,
	color,
	bg,
	isVisible,
	prefersReduced,
}: StatItemProps) {
	const animatedValue = useAnimatedCounter(value, isVisible, prefersReduced);

	return (
		<div className="bg-card relative overflow-hidden rounded-2xl border p-6 text-center sm:p-8">
			<div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			<div className={`mx-auto mb-4 inline-flex rounded-2xl p-3 ${bg}`}>
				<Icon className={`h-6 w-6 ${color}`} />
			</div>

			<p className="relative text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
				{formatNumber(animatedValue)}
			</p>

			<p className="text-muted-foreground relative mt-2 text-sm font-medium sm:text-base">
				{label}
			</p>
		</div>
	);
}

const statConfig: {
	key: keyof PlatformStats;
	icon: Icon;
	label: string;
	color: string;
	bg: string;
}[] = [
	{
		key: "departments",
		icon: BuildingsIcon,
		label: "Dipartimenti",
		color: "text-brand",
		bg: "bg-primary/10",
	},
	{
		key: "courses",
		icon: DiplomaIcon,
		label: "Corsi di laurea",
		color: "text-blue-600",
		bg: "bg-blue-500/10",
	},
	{
		key: "classes",
		icon: BookIcon,
		label: "Corsi",
		color: "text-purple-600",
		bg: "bg-purple-500/10",
	},
	{
		key: "sections",
		icon: DocumentTextIcon,
		label: "Sezioni",
		color: "text-green-600",
		bg: "bg-green-500/10",
	},
];

export function PlatformStatsSection({ stats }: { stats: PlatformStats }) {
	const prefersReduced = useReducedMotion();
	const { ref: headingRef, isVisible: headingVisible } = useScrollReveal();
	const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

	const fadeUp = withReducedMotion(fadeInUp, prefersReduced);
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	return (
		<section className="relative overflow-hidden py-20 sm:py-28">
			<div className="container">
				<motion.div
					ref={headingRef}
					className="mb-16 text-center"
					variants={fadeUp}
					initial="hidden"
					animate={headingVisible ? "visible" : "hidden"}
				>
					<p className="text-brand eyebrow-lg mb-3">La piattaforma in numeri</p>
					<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
						Cresce ogni giorno grazie alla community
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
						Studenti come te contribuiscono con nuove domande, correzioni e materiale.
						Ecco cosa abbiamo costruito insieme.
					</p>
				</motion.div>

				<motion.div
					ref={gridRef}
					className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
					variants={container}
					initial="hidden"
					animate={gridVisible ? "visible" : "hidden"}
				>
					{statConfig.map(cfg => (
						<motion.div key={cfg.key} variants={item}>
							<StatItem
								icon={cfg.icon}
								value={stats[cfg.key]}
								label={cfg.label}
								color={cfg.color}
								bg={cfg.bg}
								isVisible={gridVisible}
								prefersReduced={prefersReduced}
							/>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
