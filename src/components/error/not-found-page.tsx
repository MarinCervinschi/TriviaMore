import { HomeIcon } from "@solar-icons/react/linear/home";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { QuestionCircleIcon } from "@solar-icons/react/linear/question-circle";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { PageBand } from "@/components/layout/page-band";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
	scaleIn,
	staggerContainer,
	staggerItem,
	withReducedMotion,
} from "@/lib/motion";

export function NotFoundPage({
	message = "La pagina che stai cercando non esiste o è stata spostata.",
}: {
	message?: string;
}) {
	const prefersReduced = useReducedMotion();
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);
	const scale = withReducedMotion(scaleIn, prefersReduced);

	return (
		<div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
			{/* Background */}
			<PageBand />

			<motion.div
				className="relative flex flex-col items-center"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				{/* Floating question mark */}
				<motion.div
					className="mb-6"
					animate={prefersReduced ? undefined : { y: [0, -10, 0] }}
					transition={
						prefersReduced
							? undefined
							: { duration: 3, repeat: Infinity, ease: "easeInOut" }
					}
				>
					<div className="bg-primary/10 inline-flex rounded-3xl p-5">
						<QuestionCircleIcon className="text-primary h-12 w-12" />
					</div>
				</motion.div>

				{/* 404 */}
				<motion.h1
					className="gradient-text text-8xl font-bold tracking-tighter sm:text-9xl"
					variants={scale}
				>
					404
				</motion.h1>

				{/* Playful subheading */}
				<motion.h2 className="mt-4 text-xl font-semibold sm:text-2xl" variants={item}>
					Questa domanda non era nel quiz!
				</motion.h2>

				<motion.p className="text-muted-foreground mt-3 max-w-md" variants={item}>
					{message}
				</motion.p>

				{/* Buttons */}
				<motion.div className="mt-10 flex gap-3" variants={item}>
					<Button asChild>
						<Link to="/">
							<HomeIcon className="mr-2 h-4 w-4" />
							Torna alla home
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link to="/browse">
							<MagnifierIcon className="mr-2 h-4 w-4" />
							Esplora
						</Link>
					</Button>
				</motion.div>
			</motion.div>
		</div>
	);
}
