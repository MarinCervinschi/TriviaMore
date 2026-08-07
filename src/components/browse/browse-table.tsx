import type { ReactNode } from "react";

export type BrowseTableHeader = string | { label: string; className?: string };

export function BrowseTable({
	headers,
	children,
}: {
	headers: BrowseTableHeader[];
	children: ReactNode;
}) {
	return (
		<div className="overflow-hidden rounded-2xl border">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-muted/50 border-b">
							{headers.map((header, i) => {
								const label = typeof header === "string" ? header : header.label;
								const extra =
									typeof header === "string" ? "" : (header.className ?? "");
								return (
									<th
										key={label}
										className={`text-muted-foreground px-3 py-3 text-xs font-medium tracking-wider whitespace-nowrap uppercase first:pl-6 last:pr-6 ${i === 0 ? "w-[40%] text-left" : "text-center"} ${extra}`}
									>
										{label}
									</th>
								);
							})}
							{/* Arrow column */}
							<th className="w-10 pr-6" />
						</tr>
					</thead>
					<tbody className="divide-y">{children}</tbody>
				</table>
			</div>
		</div>
	);
}
