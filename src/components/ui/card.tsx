import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** `panel` is the page-level surface: one radius step up, padding left to the caller. */
	level?: "card" | "panel";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, level = "card", ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"bg-card text-card-foreground border shadow-sm transition-shadow duration-300",
				level === "panel" ? "rounded-3xl" : "rounded-2xl",
				className
			)}
			{...props}
		/>
	)
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col space-y-1.5 p-6", className)}
		{...props}
	/>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("leading-none font-semibold tracking-tight", className)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("text-muted-foreground text-sm", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

type Corner = "tl" | "tr" | "bl" | "br";

const CORNER_ORIGIN: Record<Corner, string> = {
	tl: "0% 0%",
	tr: "100% 0%",
	bl: "0% 100%",
	br: "100% 100%",
};

interface CardTextureProps {
	/** Which corner the detail sits in — D27: it goes in the *empty* corner, never under content. */
	corner?: Corner;
	/** A soft primary glow in the same corner. D27: off by default, on only for large/wide cards. */
	glow?: boolean;
	/** Dot spacing in px. */
	pitch?: number;
	/** How far the detail reaches across the card, in % of the side. */
	reach?: number;
	className?: string;
}

/**
 * D27's surface texture: a corner-anchored dot field, faded out radially, with an optional glow.
 * The alphas are theme tokens (`--card-dot-alpha` / `--card-glow-alpha`); colour of a category stays
 * on the icon, never on the dots. **Its parent needs `relative overflow-hidden`** to clip it.
 */
function CardTexture({
	corner = "br",
	glow = false,
	pitch = 12,
	reach = 100,
	className,
}: CardTextureProps) {
	const origin = CORNER_ORIGIN[corner];
	const mask = `radial-gradient(${reach}% ${reach}% at ${origin}, black 0%, black 30%, transparent 82%)`;

	const dots = {
		backgroundImage:
			"radial-gradient(circle, hsl(var(--foreground) / var(--card-dot-alpha)) 1px, transparent 1px)",
		backgroundSize: `${pitch}px ${pitch}px`,
		WebkitMaskImage: mask,
		maskImage: mask,
	} as React.CSSProperties;

	const glowStyle = {
		backgroundImage: `radial-gradient(${reach}% ${reach}% at ${origin}, hsl(var(--primary) / var(--card-glow-alpha)), transparent 70%)`,
	} as React.CSSProperties;

	return (
		<div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
			{glow && <div className="absolute inset-0" style={glowStyle} />}
			<div className="absolute inset-0" style={dots} />
		</div>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
	CardTexture,
};
