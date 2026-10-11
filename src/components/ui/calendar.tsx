import type { CSSProperties, ChangeEvent, ComponentProps } from "react";

import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { it } from "react-day-picker/locale";
import "react-day-picker/style.css";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	"--rdp-day_button-border-radius": "var(--radius-lg)",
} as CSSProperties;

/** The month and year pickers as the app's own Select instead of a native `<select>`. */
function CalendarDropdown({
	options,
	value,
	onChange,
	disabled,
	"aria-label": label,
}: DropdownProps) {
	return (
		<Select
			value={value === undefined ? undefined : String(value)}
			disabled={disabled}
			onValueChange={next =>
				onChange?.({ target: { value: next } } as ChangeEvent<HTMLSelectElement>)
			}
		>
			<SelectTrigger
				aria-label={label}
				className="hover:bg-muted h-8 w-auto gap-1 border-0 bg-transparent px-2 font-semibold shadow-none focus:ring-offset-0"
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent position="popper" className="max-h-64">
				{options?.map(option => (
					<SelectItem
						key={option.value}
						value={String(option.value)}
						disabled={option.disabled}
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function Calendar({ className, showOutsideDays = true, ...props }: CalendarProps) {
	return (
		<DayPicker
			locale={it}
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			style={CALENDAR_TOKENS}
			components={{
				Chevron: ({ orientation, className: chevronClassName }) => {
					const Icon = orientation === "left" ? AltArrowLeftIcon : AltArrowRightIcon;
					return <Icon className={cn("size-4", chevronClassName)} />;
				},
				Dropdown: CalendarDropdown,
			}}
			{...props}
		/>
	);
}

export { Calendar };
