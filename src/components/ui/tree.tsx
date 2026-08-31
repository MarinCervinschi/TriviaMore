import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A static hierarchy view without a headless-tree dependency. Each row renders one
 * gutter cell per ancestor level; what a cell draws depends on `connector`.
 * `elbow` is the ReUI/Linear look: a straight vertical while that ancestor
 * continues below, and a rounded elbow into the row (`└` when the row is the last
 * child, `├` otherwise). `rail` is the file-explorer look: one full-height vertical
 * per level, the shape nested `border-l` containers produce, so the line runs past
 * the last child. The caller passes `guides` — one boolean per level, "does the line
 * at this depth continue below me", read by `elbow` only — and owns the expand
 * state. `reach` widens the deepest cell so the connector reaches a row whose
 * content is indented further (e.g. a leaf that stands in for a missing toggle).
 */
type TreeConnector = "elbow" | "rail" | "none";

const TreeContext = React.createContext<{ indent: number; connector: TreeConnector }>({
	indent: 20,
	connector: "elbow",
});

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Pixels per level, and the guide spacing. */
	indent?: number;
	/** Elbow connectors, full-height rails, or plain indentation. */
	connector?: TreeConnector;
}

function Tree({ indent = 20, connector = "elbow", className, ...props }: TreeProps) {
	return (
		<TreeContext.Provider value={{ indent, connector }}>
			<div data-slot="tree" className={cn("flex flex-col", className)} {...props} />
		</TreeContext.Provider>
	);
}

/** One indent cell: a vertical rail, or the rounded elbow into the row. */
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
				{/* solid vertical + rounded corner + a short solid start */}
				<span
					className="border-border absolute top-0 h-1/2 rounded-bl-[6px] border-b border-l"
					style={{ left, width: 10 }}
				/>
				{/* dashed continuation, fading out before the row */}
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
