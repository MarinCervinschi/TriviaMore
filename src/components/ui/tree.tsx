import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A static hierarchy view — the "indented lines" look of ReUI's Tree without its
 * headless-tree/Base UI machinery, which we don't need for a small fixed tree.
 * The vertical guide lines are one repeating gradient on the container; each row
 * is padded by `level × indent` and its content carries an opaque background, so
 * the lines show only in the indent gutter to its left. Expansion is the
 * caller's own state.
 */
const TreeContext = React.createContext<{ indent: number }>({ indent: 20 });

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Pixels per level, and the guide-line spacing. */
	indent?: number;
	/** Draw the vertical indent guide lines. */
	lines?: boolean;
}

function Tree({ indent = 20, lines = true, className, style, ...props }: TreeProps) {
	const mergedStyle: React.CSSProperties = {
		...style,
		...(lines && {
			// A 1px guide at the right edge of every indent step (ReUI), nudged
			// 4px left so it sits just past the parent's toggle.
			backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${indent - 1}px, var(--color-border) ${indent - 1}px, var(--color-border) ${indent}px)`,
			backgroundPosition: "-4px 0",
		}),
	};
	return (
		<TreeContext.Provider value={{ indent }}>
			<div
				data-slot="tree"
				style={mergedStyle}
				className={cn("flex flex-col", className)}
				{...props}
			/>
		</TreeContext.Provider>
	);
}

interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Depth from the root (0 = top level). */
	level: number;
}

function TreeItem({ level, className, style, ...props }: TreeItemProps) {
	const { indent } = React.useContext(TreeContext);
	return (
		<div
			data-slot="tree-item"
			style={{ ...style, paddingInlineStart: `${level * indent}px` }}
			className={cn("relative", className)}
			{...props}
		/>
	);
}

export { Tree, TreeItem };
