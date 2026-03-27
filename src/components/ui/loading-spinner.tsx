import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { LogoIcon } from "@/components/ui/logo"

interface LoadingSpinnerProps {
	size?: "sm" | "default" | "lg"
	className?: string
	text?: string
}

const sizeConfig = {
	sm: { logo: 16, ring: 28, stroke: 2 },
	default: { logo: 24, ring: 40, stroke: 2.5 },
	lg: { logo: 32, ring: 52, stroke: 3 },
}

export function LoadingSpinner({
	size = "default",
	className,
	text,
}: LoadingSpinnerProps) {
	const prefersReduced = useReducedMotion()
	const { logo, ring, stroke } = sizeConfig[size]
	const r = (ring - stroke) / 2

	return (
		<div className={cn("flex flex-col items-center justify-center gap-3", className)}>
			<div className="relative" style={{ width: ring, height: ring }}>
				{/* Rotating ring */}
				{!prefersReduced && (
					<motion.svg
						className="absolute inset-0"
						width={ring}
						height={ring}
						viewBox={`0 0 ${ring} ${ring}`}
						animate={{ rotate: 360 }}
						transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
					>
						<circle
							cx={ring / 2}
							cy={ring / 2}
							r={r}
							fill="none"
							stroke="hsl(var(--primary))"
							strokeWidth={stroke}
							strokeLinecap="round"
							strokeDasharray={`${r * Math.PI * 0.7} ${r * Math.PI * 1.3}`}
							opacity={0.6}
						/>
					</motion.svg>
				)}

				{/* Static track */}
				<svg
					className="absolute inset-0"
					width={ring}
					height={ring}
					viewBox={`0 0 ${ring} ${ring}`}
				>
					<circle
						cx={ring / 2}
						cy={ring / 2}
						r={r}
						fill="none"
						stroke="hsl(var(--muted))"
						strokeWidth={stroke}
					/>
				</svg>

				{/* Center logo */}
				<div className="absolute inset-0 flex items-center justify-center">
					<LogoIcon size={logo} />
				</div>
			</div>

			{text && (
				<motion.span
					className="text-sm text-muted-foreground"
					initial={prefersReduced ? undefined : { opacity: 0 }}
					animate={prefersReduced ? undefined : { opacity: [0.5, 1, 0.5] }}
					transition={prefersReduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
				>
					{text}
				</motion.span>
			)}
		</div>
	)
}
