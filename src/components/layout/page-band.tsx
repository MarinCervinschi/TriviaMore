import { cn } from "@/lib/utils";

interface PageBandProps {
	/** `public` is the same band with both intensities turned up — not a second system. */
	level?: "app" | "public";
	className?: string;
}

// Put this first inside a `relative isolate` wrapper: it sits behind the page's own content on
// -z-10, and `isolate` keeps that from escaping.
//
// Two layers because the two devices need the same axis but not the same reach: the dots fade
// vertically over the band's own height, which is what makes every dense surface below it flat, and
// the orb needs a little more room than that or its radial gets clipped instead of faded.
export function PageBand({ level = "app", className }: PageBandProps) {
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
			<div
				className={cn(
					"band-glow absolute inset-x-0 top-0",
					isPublic ? "h-[34rem]" : "h-[26rem]"
				)}
			/>
			<div
				className={cn(
					"band-dots absolute inset-x-0 top-0",
					isPublic ? "h-[36rem]" : "h-80"
				)}
			/>
		</div>
	);
}
