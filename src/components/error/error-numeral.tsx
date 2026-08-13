import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The big dissolving numeral on an error page — the whole treatment lives in the
 * `gradient-text-fade` utility, which explains the three layers it stacks.
 *
 * It is **not a heading**. It is `aria-hidden` decoration: a screen reader gains nothing from "404",
 * the message beside it carries the meaning, and a hidden `<h1>` would leave the page with an `<h2>`
 * as its first heading. The message is the `<h1>`.
 */
export function ErrorNumeral({
	children,
	className,
	style,
}: {
	children: ReactNode;
	className?: string;
	/** Only so a story can subtract one of the treatment's layers to show what each contributes. */
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
