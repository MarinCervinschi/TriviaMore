import type { ReactNode } from "react";

/** A console page: its title and actions on top, the content below. */
export function ConsolePage({
	title,
	description,
	actions,
	children,
}: {
	title: string;
	description?: string;
	actions?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="space-y-6 px-4 py-6 sm:px-6">
			<div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
				<div className="min-w-0">
					<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
					{description && (
						<p className="text-muted-foreground mt-1 max-w-2xl text-sm">
							{description}
						</p>
					)}
				</div>
				{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
			</div>
			{children}
		</div>
	);
}
