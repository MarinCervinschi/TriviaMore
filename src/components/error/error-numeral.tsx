import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Decoration, not a heading: the message beside it is the `<h1>`. */
export function ErrorNumeral({
	children,
	className,
	style,
}: {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}) {
	return (
		<span
			aria-hidden
			style={style}
			className={cn(
				"gradient-text-fade block text-8xl leading-none font-bold tracking-tighter sm:text-9xl",
				className
			)}
		>
			{children}
		</span>
	);
}
