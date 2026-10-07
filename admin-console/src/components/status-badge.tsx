import { cn } from "@/lib/utils";

export type Status = "success" | "warning" | "info" | "danger" | "neutral";

const STATUS_CLASS: Record<Status, string> = {
	success: "bg-success/10 text-success border-success/20",
	warning: "bg-warning/10 text-warning border-warning/20",
	info: "bg-info/10 text-info border-info/20",
	danger: "bg-destructive/10 text-danger border-destructive/20",
	neutral: "bg-muted text-muted-foreground border-border",
};

/** An outcome: a run that passed, a source that is stale. */
export function StatusBadge({
	status,
	children,
}: {
	status: Status;
	children: string;
}) {
	return (
		<span
			className={cn(
				"text-2xs inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 font-medium",
				STATUS_CLASS[status]
			)}
		>
			{children}
		</span>
	);
}
