import { HomeIcon } from "@solar-icons/react/linear/home";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { QuestionCircleIcon } from "@solar-icons/react/linear/question-circle";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { ErrorNumeral } from "@/components/error/error-numeral";
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
	title = "Pagina non trovata",
	message = "La pagina che stai cercando non esiste o è stata spostata.",
	withBand = true,
}: {
	title?: string;
	message?: string;
	withBand?: boolean;
}) {
	const prefersReduced = useReducedMotion();
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);
	const scale = withReducedMotion(scaleIn, prefersReduced);

	return (
		<div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
			{withBand && <PageBand />}

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
						<QuestionCircleIcon className="text-brand h-12 w-12" />
					</div>
				</motion.div>

				<motion.div variants={scale}>
					<ErrorNumeral>404</ErrorNumeral>
				</motion.div>
				<motion.h1
					className="-mt-2 text-xl font-semibold sm:-mt-4 sm:text-2xl"
					variants={item}
				>
					{title}
				</motion.h1>

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
