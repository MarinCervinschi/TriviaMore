import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import type { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	icon: Icon;
	title: string;
	description: string;
	actionLabel?: string;
	actionHref?: string;
	onAction?: () => void;
	className?: string;
	children?: React.ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	actionHref,
	onAction,
	className,
	children,
}: EmptyStateProps) {
	const prefersReduced = useReducedMotion();
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	return (
		<motion.div
			className={cn(
				"bg-card relative overflow-hidden rounded-3xl border p-12",
				className
			)}
			variants={container}
			initial="hidden"
			animate="visible"
		>
			{/* Decorative orb */}
			<div className="bg-primary/10 pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-[60px]" />

			<div className="relative text-center">
				<motion.div
					className="bg-primary/10 mx-auto mb-4 inline-flex rounded-2xl p-4"
					variants={item}
				>
					<Icon className="text-brand h-10 w-10" />
				</motion.div>

				<motion.h2 className="mb-2 text-xl font-semibold" variants={item}>
					{title}
				</motion.h2>

				<motion.p className="text-muted-foreground mb-6" variants={item}>
					{description}
				</motion.p>

				{actionLabel && actionHref && (
					<motion.div variants={item}>
						<Button asChild className="shadow-primary/25 shadow-lg">
							<Link to={actionHref}>{actionLabel}</Link>
						</Button>
					</motion.div>
				)}

				{actionLabel && onAction && !actionHref && (
					<motion.div variants={item}>
						<Button onClick={onAction} className="shadow-primary/25 shadow-lg">
							{actionLabel}
						</Button>
					</motion.div>
				)}

				{children && <motion.div variants={item}>{children}</motion.div>}
			</div>
		</motion.div>
	);
}

/**
 * The empty message for a panel that already has its own frame — a table's card, a chart's card.
 * `EmptyState` *is* the frame; this one goes inside someone else's.
 *
 * It replaces DataTableEmpty and ChartEmpty, which were the same three lines in two files, eight
 * pixels of padding apart.
 */
export function InlineEmpty({
	children = "Nessun dato da mostrare.",
}: {
	children?: ReactNode;
}) {
	return <p className="text-muted-foreground py-10 text-center text-sm">{children}</p>;
}
