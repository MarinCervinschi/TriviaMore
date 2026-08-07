import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AnimatedStack } from "./animated-block";

type SummaryPanelProps = {
	children: ReactNode;
	footerTip?: string;
	className?: string;
};

export function SummaryPanel({ children, footerTip, className }: SummaryPanelProps) {
	return (
		<aside
			className={cn(
				"bg-muted/30 text-foreground flex flex-col gap-5 p-5",
				"border-border border-t sm:border-t-0 sm:border-l",
				className
			)}
		>
			<h2 className="sr-only">Riepilogo della sessione</h2>
			<div className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
				Riepilogo
			</div>
			<AnimatedStack className="flex flex-1 flex-col gap-5">{children}</AnimatedStack>
			{footerTip && (
				<div className="border-border/60 text-muted-foreground mt-auto border-t pt-4 text-[10.5px] leading-relaxed">
					{footerTip}
				</div>
			)}
		</aside>
	);
}
