import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** `panel` is one radius step up and leaves padding to the caller. */
	level?: "card" | "panel";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, level = "card", ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"bg-card text-card-foreground border-border/50 border shadow-xs transition-shadow duration-300",
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

export type TexturePlacement =
	| "full"
	| "top"
	| "bottom"
	| "left"
	| "right"
	| Corner
	| "center"
	| "ellipse"
	| "edges";

const TEXTURE_FADE: Record<TexturePlacement, string | undefined> = {
	full: undefined,
	top: "linear-gradient(to bottom, #000 0%, #000 10%, transparent 72%)",
	bottom: "linear-gradient(to top, #000 0%, #000 10%, transparent 72%)",
	left: "linear-gradient(to right, #000 0%, #000 10%, transparent 72%)",
	right: "linear-gradient(to left, #000 0%, #000 10%, transparent 72%)",
	tl: "radial-gradient(125% 125% at 0% 0%, #000 0%, transparent 60%)",
	tr: "radial-gradient(125% 125% at 100% 0%, #000 0%, transparent 60%)",
	bl: "radial-gradient(125% 125% at 0% 100%, #000 0%, transparent 60%)",
	br: "radial-gradient(125% 125% at 100% 100%, #000 0%, transparent 60%)",
	center: "radial-gradient(70% 70% at 50% 50%, #000 0%, transparent 78%)",
	ellipse: "radial-gradient(95% 55% at 50% 50%, #000 0%, transparent 80%)",
	edges: "radial-gradient(75% 75% at 50% 50%, transparent 28%, #000 92%)",
};

// Integer math only, because a float hash differs between Node and the browser and breaks hydration.
function textureHash(i: number, seed: number): number {
	let h = Math.imul(i + 1, 374761393) ^ Math.imul(seed + 1, 2654435761);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
}

const TEXTURE_MIN_SIZE = 0.5;
const TEXTURE_N = 12;

interface CardTextureProps {
	placement?: TexturePlacement;
	/** Alias for a corner `placement`. */
	corner?: Corner;
	/** Grid spacing in px. */
	gap?: number;
	/** Largest pixel edge in px; each pixel is sized 0.5–`maxSize`. */
	maxSize?: number;
	/** Base opacity; defaults to the `--card-pixel-alpha` token. */
	alpha?: number;
	className?: string;
}

/** A static pixel field; its parent needs `relative overflow-hidden` to clip it. */
function CardTexture({
	placement,
	corner,
	gap = 4,
	maxSize = 2,
	alpha,
	className,
}: CardTextureProps) {
	const id = React.useId().replace(/:/g, "");
	const where = placement ?? corner ?? "tl";
	const fade = TEXTURE_FADE[where];
	const opacity = alpha != null ? String(alpha) : "var(--card-pixel-alpha)";
	const tile = TEXTURE_N * gap;
	const cells = Array.from({ length: TEXTURE_N * TEXTURE_N }, (_, i) => {
		const size = TEXTURE_MIN_SIZE + textureHash(i, 1) * (maxSize - TEXTURE_MIN_SIZE);
		const inset = (maxSize - size) / 2;
		return {
			x: (i % TEXTURE_N) * gap + inset,
			y: Math.floor(i / TEXTURE_N) * gap + inset,
			size,
			opacity: 0.45 + textureHash(i, 2) * 0.55,
		};
	});

	return (
		<div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
			<div
				className="absolute inset-0"
				style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
			>
				<svg
					className="block h-full w-full"
					style={{ color: `hsl(var(--foreground) / ${opacity})` }}
				>
					<defs>
						<pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
							{cells.map((c, i) => (
								<rect
									key={i}
									x={c.x}
									y={c.y}
									width={c.size}
									height={c.size}
									fill="currentColor"
									fillOpacity={c.opacity}
								/>
							))}
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill={`url(#${id})`} />
				</svg>
			</div>
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
