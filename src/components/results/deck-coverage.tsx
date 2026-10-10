import { cn } from "@/lib/utils";

export function DeckCoverage({
	total,
	studied,
	className,
}: {
	total: number;
	studied: number;
	className?: string;
}) {
	const left = Math.max(0, total - studied);

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div
				className="grid grid-cols-8 gap-1.5"
				role="img"
				aria-label={`${studied} carte girate su ${total}`}
			>
				{Array.from({ length: total }, (_, index) => (
					<div
						key={index}
						className={cn(
							"h-5 rounded-sm",
							index < studied ? "bg-success" : "bg-muted"
						)}
					/>
				))}
			</div>
			<p className="text-muted-foreground text-xs">
				{studied} {studied === 1 ? "carta girata" : "carte girate"} su {total}.
				{left > 0 && (left === 1 ? " Ne resta 1." : ` Ne restano ${left}.`)}
			</p>
		</div>
	);
}
