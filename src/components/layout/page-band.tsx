import { cn } from "@/lib/utils";

interface PageBandProps {
	level?: "app" | "public";
	glow?: boolean;
	className?: string;
}

/** Put it first inside a `relative isolate` wrapper; it sits behind the content on -z-10. */
export function PageBand({ level = "app", glow = true, className }: PageBandProps) {
	const isPublic = level === "public";

	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute inset-x-0 top-0 -z-10",
				isPublic &&
					"[--dot-alpha:0.24] [--glow-alpha:0.26] dark:[--dot-alpha:0.3] dark:[--glow-alpha:0.38]",
				className
			)}
		>
			{glow && (
				<div
					className={cn(
						"band-glow absolute inset-x-0 top-0",
						isPublic ? "h-[34rem]" : "h-[26rem]"
					)}
				/>
			)}
			<div
				className={cn(
					"band-dots absolute inset-x-0 top-0",
					isPublic ? "h-[36rem]" : "h-80"
				)}
			/>
		</div>
	);
}
