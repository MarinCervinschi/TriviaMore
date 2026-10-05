import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";

type AnimatedProps = {
	children: ReactNode;
	className?: string;
};

export function AnimatedStack({ children, className }: AnimatedProps) {
	const prefersReduced = useReducedMotion();
	return (
		<motion.div
			className={className}
			variants={withReducedMotion(staggerContainer, prefersReduced)}
			initial="hidden"
			animate="visible"
		>
			{children}
		</motion.div>
	);
}

export function AnimatedBlock({ children, className }: AnimatedProps) {
	const prefersReduced = useReducedMotion();
	return (
		<motion.div
			className={className}
			variants={withReducedMotion(staggerItem, prefersReduced)}
		>
			{children}
		</motion.div>
	);
}
