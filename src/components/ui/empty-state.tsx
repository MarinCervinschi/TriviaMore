import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	icon: LucideIcon;
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
					<Icon className="text-primary h-10 w-10" strokeWidth={1.5} />
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
