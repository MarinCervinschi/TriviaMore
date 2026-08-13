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

/* Every class written out: Tailwind never generates a name assembled at runtime. */
const ORB = {
	sm: {
		size: "h-24 w-24 blur-[30px]",
		tr: "-top-6 -right-6",
		tl: "-top-6 -left-6",
		br: "-right-6 -bottom-6",
		bl: "-bottom-6 -left-6",
	},
	md: {
		size: "h-32 w-32 blur-[40px]",
		tr: "-top-10 -right-10",
		tl: "-top-10 -left-10",
		br: "-right-10 -bottom-10",
		bl: "-bottom-10 -left-10",
	},
	lg: {
		size: "h-48 w-48 blur-[60px]",
		tr: "-top-20 -right-20",
		tl: "-top-20 -left-20",
		br: "-right-20 -bottom-20",
		bl: "-bottom-20 -left-20",
	},
} as const;

interface CardOrbProps {
	/** A `bg-*` class — D4's tints stay with their callers. */
	tint?: string;
	size?: keyof typeof ORB;
	corner?: "tr" | "tl" | "br" | "bl";
	className?: string;
}

/** D4's decorative orb. **Its parent needs `relative overflow-hidden`** to clip it. */
function CardOrb({
	tint = "bg-primary/10",
	size = "sm",
	corner = "tr",
	className,
}: CardOrbProps) {
	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute rounded-full",
				ORB[size].size,
				ORB[size][corner],
				tint,
				className
			)}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
	CardOrb,
};
