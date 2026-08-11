import { motion } from "framer-motion";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeInUp, withReducedMotion } from "@/lib/motion";

export function LoadingPage() {
	const prefersReduced = useReducedMotion();
	const variants = withReducedMotion(fadeInUp, prefersReduced);

	return (
		<div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
			{/* Background texture */}

			<motion.div
				className="flex flex-col items-center"
				variants={variants}
				initial="hidden"
				animate="visible"
			>
				<LoadingSpinner size="lg" text="Caricamento..." />
			</motion.div>
		</div>
	);
}
