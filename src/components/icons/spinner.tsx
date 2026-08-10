import { cn } from "@/lib/utils";

interface SpinnerProps {
	className?: string;
	label?: string;
}

// A spinner is motion, not an icon: it owns its own animation and announces itself as a status,
// rather than being an aria-hidden icon that a call site remembers to spin.

export function Spinner({ className, label = "Caricamento" }: SpinnerProps) {
	return (
		<span role="status" className={cn("inline-flex size-4 shrink-0", className)}>
			<svg
				className="size-full animate-spin"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<circle
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="1.5"
					opacity="0.25"
				/>
				<path
					d="M22 12C22 6.47715 17.5228 2 12 2"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
			<span className="sr-only">{label}</span>
		</span>
	);
}
