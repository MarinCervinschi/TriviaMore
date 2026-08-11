import type { AddFolderIcon } from "@solar-icons/react/linear/add-folder";

import { cn } from "@/lib/utils";

export function TypeCard({
	icon: Icon,
	title,
	description,
	selected,
	onClick,
}: {
	icon: typeof AddFolderIcon;
	title: string;
	description: string;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
				selected
					? "border-primary bg-primary/5"
					: "bg-muted/50 hover:bg-accent/50 border-transparent"
			)}
		>
			<div className={cn("rounded-xl p-2", selected ? "bg-primary/10" : "bg-muted")}>
				<Icon
					className={cn("size-5", selected ? "text-brand" : "text-muted-foreground")}
				/>
			</div>
			<div>
				<p className="text-sm font-medium">{title}</p>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
		</button>
	);
}
