import * as React from "react";

import { cn } from "@/lib/utils";

type TreeConnector = "elbow" | "rail" | "none";

const TreeContext = React.createContext<{ indent: number; connector: TreeConnector }>({
	indent: 20,
	connector: "elbow",
});

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Pixels per level. */
	indent?: number;
	connector?: TreeConnector;
}

function Tree({ indent = 20, connector = "elbow", className, ...props }: TreeProps) {
	return (
		<TreeContext.Provider value={{ indent, connector }}>
			<div data-slot="tree" className={cn("flex flex-col", className)} {...props} />
		</TreeContext.Provider>
	);
}

function Guide({
	indent,
	connector,
	continues,
	deepest,
	reach,
}: {
	indent: number;
	connector: TreeConnector;
	continues: boolean;
	deepest: boolean;
	reach: number;
}) {
	const left = Math.round(indent / 2);
	const width = deepest ? indent + reach : indent;

	if (connector === "elbow" && deepest) {
		return (
			<div className="relative shrink-0" style={{ width }} aria-hidden>
				<span
					className="border-border absolute top-0 h-1/2 rounded-bl-[6px] border-b border-l"
					style={{ left, width: 10 }}
				/>
				<span
					className="border-border/70 absolute top-0 h-1/2 border-b border-dashed"
					style={{ left: left + 8, right: 8 }}
				/>
				{continues && (
					<span
						className="border-border absolute top-1/2 bottom-0 border-l"
						style={{ left }}
					/>
				)}
			</div>
		);
	}

	const draw = connector === "rail" || continues;
	return (
		<div className="relative shrink-0" style={{ width }} aria-hidden>
			{draw && (
				<span
					className={cn(
						"absolute inset-y-0 border-l",
						connector === "rail" ? "border-border/60" : "border-border"
					)}
					style={{ left }}
				/>
			)}
		</div>
	);
}

interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Depth from the root (0 = top level). */
	level: number;
	/** Per ancestor level: does the guide line continue below this row? */
	guides?: boolean[];
	/** Extra width on the deepest cell, so the connector reaches an indented row. */
	reach?: number;
}

function TreeItem({
	level,
	guides = [],
	reach = 0,
	className,
	children,
	...props
}: TreeItemProps) {
	const { indent, connector } = React.useContext(TreeContext);
	return (
		<div data-slot="tree-item" className={cn("flex", className)} {...props}>
			{level > 0 &&
				(connector === "none" ? (
					<div className="shrink-0" style={{ width: level * indent }} />
				) : (
					Array.from({ length: level }).map((_, i) => (
						<Guide
							key={i}
							indent={indent}
							connector={connector}
							continues={guides[i] ?? false}
							deepest={i === level - 1}
							reach={i === level - 1 ? reach : 0}
						/>
					))
				))}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

export { Tree, TreeItem };
export type { TreeConnector };
