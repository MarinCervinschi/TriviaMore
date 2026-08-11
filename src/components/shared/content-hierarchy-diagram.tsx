import { Fragment } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { BookIcon } from "@solar-icons/react/linear/book";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { motion } from "framer-motion";

import type { Icon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ContentLevel {
	icon: Icon;
	label: string;
	example: string;
	description: string;
	color: string;
	bg: string;
	borderColor: string;
}

export const CONTENT_LEVELS: ContentLevel[] = [
	{
		icon: BuildingsIcon,
		label: "Dipartimento",
		example: 'Ingegneria "Enzo Ferrari"',
		description: "la facoltà di riferimento",
		color: "text-brand",
		bg: "bg-primary/10",
		borderColor: "border-primary/30",
	},
	{
		icon: DiplomaIcon,
		label: "Corso di laurea",
		example: "Ingegneria Informatica",
		description: "il percorso di laurea",
		color: "text-blue-600",
		bg: "bg-blue-500/10",
		borderColor: "border-blue-500/30",
	},
	{
		icon: BookIcon,
		label: "Insegnamento",
		example: "Basi di Dati",
		description: "l'insegnamento specifico",
		color: "text-purple-600",
		bg: "bg-purple-500/10",
		borderColor: "border-purple-500/30",
	},
	{
		icon: DocumentTextIcon,
		label: "Sezione",
		example: "SQL e Algebra Relazionale",
		description: "l'argomento su cui esercitarti",
		color: "text-green-600",
		bg: "bg-green-500/10",
		borderColor: "border-green-500/30",
	},
];

function TreeCard({ level }: { level: ContentLevel }) {
	const Icon = level.icon;

	return (
		<div
			className={cn(
				"bg-card h-full w-full rounded-2xl border p-4 sm:p-5",
				level.borderColor
			)}
		>
			<div className="flex items-center gap-3">
				<div className={cn("shrink-0 rounded-xl p-2.5", level.bg)}>
					<Icon className={cn("h-5 w-5", level.color)} aria-hidden />
				</div>
				<div className="min-w-0">
					<p className={cn("eyebrow", level.color)}>{level.label}</p>
					<p className="truncate text-sm font-medium">{level.example}</p>
				</div>
			</div>
		</div>
	);
}

function VerticalConnector() {
	return (
		<div className="flex flex-col items-center py-2" aria-hidden>
			<div className="bg-border h-4 w-px" />
			<AltArrowDownIcon className="text-muted-foreground/60 -mt-1 h-4 w-4" />
		</div>
	);
}

function ResponsiveConnector() {
	return (
		<div
			className="text-muted-foreground/60 flex shrink-0 items-center justify-center lg:py-0"
			aria-hidden
		>
			{/* Mobile/tablet: down arrow */}
			<div className="flex flex-col items-center py-2 lg:hidden">
				<div className="bg-border h-4 w-px" />
				<AltArrowDownIcon className="-mt-1 h-4 w-4" />
			</div>
			{/* Desktop: right arrow */}
			<div className="hidden flex-row items-center lg:flex">
				<div className="bg-border h-px w-3 xl:w-4" />
				<AltArrowRightIcon className="-ml-1 h-4 w-4" />
			</div>
		</div>
	);
}

export function ContentHierarchyDiagram({
	className,
	showFinalLabel = true,
	orientation = "vertical",
}: {
	className?: string;
	showFinalLabel?: boolean;
	orientation?: "vertical" | "horizontal";
}) {
	const prefersReduced = useReducedMotion();
	const { ref, isVisible } = useScrollReveal();

	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	const isHorizontal = orientation === "horizontal";
	const lastIndex = CONTENT_LEVELS.length - 1;

	return (
		<motion.div
			ref={ref}
			className={cn(isHorizontal ? "w-full" : "flex justify-center", className)}
			variants={container}
			initial="hidden"
			animate={isVisible ? "visible" : "hidden"}
			role="img"
			aria-label="Gerarchia dei contenuti: Dipartimento, Corso di laurea, Insegnamento, Sezione"
		>
			{isHorizontal ? (
				<div className="flex flex-col items-center gap-0 lg:flex-row lg:items-stretch lg:justify-between lg:gap-2 xl:gap-3">
					{CONTENT_LEVELS.map((level, i) => (
						<Fragment key={level.label}>
							<motion.div
								variants={item}
								className="w-full max-w-xs lg:max-w-none lg:flex-1"
							>
								<TreeCard level={level} />
							</motion.div>
							{i < lastIndex && <ResponsiveConnector />}
						</Fragment>
					))}

					{showFinalLabel && (
						<>
							<ResponsiveConnector />
							<motion.p
								variants={item}
								className="shrink-0 rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600 lg:self-center"
							>
								Quiz & Flashcard pronti
							</motion.p>
						</>
					)}
				</div>
			) : (
				<div className="flex flex-col items-center">
					{CONTENT_LEVELS.map((level, i) => (
						<Fragment key={level.label}>
							<motion.div variants={item} className="w-full max-w-xs">
								<TreeCard level={level} />
							</motion.div>
							{i < lastIndex && <VerticalConnector />}
						</Fragment>
					))}

					{showFinalLabel && (
						<motion.p
							variants={item}
							className="mt-4 rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600"
						>
							Quiz & Flashcard pronti
						</motion.p>
					)}
				</div>
			)}
		</motion.div>
	);
}
