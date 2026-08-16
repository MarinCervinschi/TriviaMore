import type { CSSProperties, ComponentProps } from "react";

import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";

import "./calendar.css";

export type CalendarProps = ComponentProps<typeof DayPicker>;

const CALENDAR_TOKENS = {
	"--rdp-accent-color": "hsl(var(--primary))",
	"--rdp-accent-background-color": "hsl(var(--accent))",
	"--rdp-today-color": "hsl(var(--primary))",
	"--rdp-range_start-color": "hsl(var(--primary-foreground))",
	"--rdp-range_end-color": "hsl(var(--primary-foreground))",
	"--rdp-range_start-date-background-color": "hsl(var(--primary))",
	"--rdp-range_end-date-background-color": "hsl(var(--primary))",
	"--rdp-range_middle-background-color": "hsl(var(--accent))",
	"--rdp-range_middle-color": "hsl(var(--accent-foreground))",
	"--rdp-day-width": "2.25rem",
	"--rdp-day-height": "2.25rem",
	"--rdp-day_button-width": "2.25rem",
	"--rdp-day_button-height": "2.25rem",
	"--rdp-day_button-border-radius": "calc(var(--radius) - 2px)",
} as CSSProperties;

function Calendar({ className, showOutsideDays = true, ...props }: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			style={CALENDAR_TOKENS}
			components={{
				Chevron: ({ orientation, className: chevronClassName }) => {
					const Icon = orientation === "left" ? AltArrowLeftIcon : AltArrowRightIcon;
					return <Icon className={cn("size-4", chevronClassName)} />;
				},
			}}
			{...props}
		/>
	);
}

export { Calendar };
