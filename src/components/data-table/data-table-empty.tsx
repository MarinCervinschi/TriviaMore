import type { ReactNode } from "react";

/** The in-card empty message for tables that sit inside their own panel. */
export function DataTableEmpty({ children }: { children: ReactNode }) {
	return <p className="text-muted-foreground py-8 text-center text-sm">{children}</p>;
}
