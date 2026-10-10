import type { ReactNode } from "react";

import { CheckGlyph } from "@/components/icons";
import type { EntryColor } from "@/lib/crm/schemas";
import { cn } from "@/lib/utils";

import type { CalendarEntry, EntryKind, Importance } from "./calendar-model";

const LEVEL_FILL: Record<Importance, string> = {
	1: "bg-heat-2",
	2: "bg-heat-3",
	3: "bg-heat-5",
};

const LEVEL_RING: Record<Importance, string> = {
	1: "ring-heat-2",
	2: "ring-heat-3",
	3: "ring-heat-5",
};

/** A task's tick: an empty ring, or a filled one with a check once done. */
function TaskCheck({ done }: { done?: boolean }) {
	return done ? (
		<span className="bg-success text-primary-foreground flex size-3.5 shrink-0 items-center justify-center rounded-full">
			<CheckGlyph className="size-2.5" />
		</span>
	) : (
		<span className="block size-3.5 shrink-0 rounded-full ring-[1.5px] ring-current ring-inset" />
	);
}

type Sample = Pick<CalendarEntry, "primary" | "level" | "done" | "color">;

type EntryKindDef = {
	/** The filter's name in the sidebar. */
	plural: string;
	mark: (entry: Sample) => ReactNode;
	/** The chip colour on the calendar, a CSS colour or variable. */
	color: (entry: Sample) => string;
	/** Stays on a whole day: an appello has a date, not an hour. */
	allDayOnly?: boolean;
	/** Ticked off on the calendar itself: the mark on the chip toggles `done`. */
	checkable?: boolean;
	/** Set when the user may pick the entry's colour; the one it takes until they do. */
	defaultColor?: EntryColor;
};

const LEVEL_COLOR: Record<Importance, string> = {
	1: "var(--color-heat-2)",
	2: "var(--color-heat-3)",
	3: "var(--color-heat-5)",
};

const DOT = "size-2.5 shrink-0 rounded-full";
const colorVar = (color: EntryColor) => `var(--color-${color})`;

const SQUARE = "size-2.5 shrink-0 rounded-[3px]";

/** Every kind the calendar draws. A new kind is a value of `EntryKind` and an entry here. */
export const ENTRY_KINDS: Record<EntryKind, EntryKindDef> = {
	sitting: {
		plural: "Appelli",
		mark: ({ primary, level = 2, done }) =>
			done ? (
				<CheckGlyph className="text-success size-3 shrink-0" />
			) : (
				<span
					className={cn(
						"block",
						DOT,
						primary ? LEVEL_FILL[level] : cn("ring-2 ring-inset", LEVEL_RING[level])
					)}
				/>
			),
		color: ({ primary, level = 2, done }) =>
			done
				? "var(--color-success)"
				: primary
					? LEVEL_COLOR[level]
					: "var(--color-muted-foreground)",
		allDayOnly: true,
	},
	event: {
		plural: "Eventi",
		mark: ({ color = "chart-4" }) => (
			<span className={cn("block", SQUARE)} style={{ background: colorVar(color) }} />
		),
		color: ({ color = "chart-4" }) => colorVar(color),
		defaultColor: "chart-4",
	},
	task: {
		plural: "Task",
		mark: ({ done }) => <TaskCheck done={done} />,
		color: ({ color = "chart-3" }) => colorVar(color),
		defaultColor: "chart-3",
		checkable: true,
	},
};
