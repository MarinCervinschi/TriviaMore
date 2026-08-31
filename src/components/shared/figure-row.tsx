import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** A divided row of headline figures, sitting at the foot of a panel. */
export function FigureRow({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("divide-border/60 grid divide-x border-t", className)}>
			{children}
		</div>
	);
}

export function Figure({
	icon: LeadIcon,
	value,
	label,
	tone,
}: {
	icon: Icon;
	value: React.ReactNode;
	label: string;
	tone?: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1 p-4">
			<LeadIcon className={cn("size-5", tone ?? "text-muted-foreground")} />
			<p className="text-2xl font-bold tabular-nums">{value}</p>
			<p className="text-muted-foreground text-xs">{label}</p>
		</div>
	);
}
