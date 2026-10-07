import { InsetCard } from "@/components/ui/inset-card";

/** One headline number, with the line that says what it counts. */
export function FigureCard({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint: string;
}) {
	return (
		<InsetCard title={label}>
			<div className="p-4">
				<p className="text-2xl font-bold tabular-nums">{value}</p>
				<p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>
			</div>
		</InsetCard>
	);
}
