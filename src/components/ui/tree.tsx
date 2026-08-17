import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A static hierarchy view with ReUI/Linear-style elbow connectors, without a
 * headless-tree dependency. Each row renders one gutter cell per ancestor level;
 * a cell draws a straight vertical when that ancestor continues below, and the
 * deepest cell draws the rounded elbow into the row (`└` when the row is the last
 * child, `├` otherwise). The caller passes `guides` — one boolean per level,
 * "does the line at this depth continue below me" — and owns the expand state.
 */
const TreeContext = React.createContext<{ indent: number; lines: boolean }>({
	indent: 20,
	lines: true,
});

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Pixels per level, and the guide spacing. */
	indent?: number;
	/** Draw the elbow connectors; when false the gutter is plain indentation. */
	lines?: boolean;
}

function Tree({ indent = 20, lines = true, className, ...props }: TreeProps) {
	return (
		<TreeContext.Provider value={{ indent, lines }}>
			<div data-slot="tree" className={cn("flex flex-col", className)} {...props} />
		</TreeContext.Provider>
	);
}

/** One indent cell: a straight vertical, or the rounded elbow into the row. */
function Guide({
	indent,
	continues,
	elbow,
}: {
	indent: number;
	continues: boolean;
	elbow: boolean;
}) {
	const left = Math.round(indent / 2);
	return (
		<div className="relative shrink-0" style={{ width: indent }} aria-hidden>
			{elbow ? (
				<>
					<span
						className="border-border absolute top-0 right-0 h-1/2 rounded-bl-[6px] border-b border-l"
						style={{ left }}
					/>
					{continues && (
						<span
							className="border-border absolute top-1/2 bottom-0 border-l"
							style={{ left }}
						/>
					)}
				</>
			) : (
				continues && (
					<span
						className="border-border absolute inset-y-0 border-l"
						style={{ left }}
					/>
				)
			)}
		</div>
	);
}

interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Depth from the root (0 = top level). */
	level: number;
	/** Per ancestor level: does the guide line continue below this row? */
	guides?: boolean[];
}

function TreeItem({
	level,
	guides = [],
	className,
	children,
	...props
}: TreeItemProps) {
	const { indent, lines } = React.useContext(TreeContext);
	return (
		<div data-slot="tree-item" className={cn("flex", className)} {...props}>
			{level > 0 &&
				(lines ? (
					Array.from({ length: level }).map((_, i) => (
						<Guide
							key={i}
							indent={indent}
							continues={guides[i] ?? false}
							elbow={i === level - 1}
						/>
					))
				) : (
					<div className="shrink-0" style={{ width: level * indent }} />
				))}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

export { Tree, TreeItem };
