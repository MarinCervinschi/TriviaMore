import { useState } from "react";

import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { format } from "date-fns";

import { formatExamDate } from "@/components/career/career-model";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const parseDay = (value: string) => {
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year!, month! - 1, day);
};

export function DateField({
	id,
	value,
	onChange,
	future = false,
}: {
	id?: string;
	value: string;
	onChange: (value: string) => void;
	/** Allows days after today. */
	future?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const selected = value ? parseDay(value) : undefined;
	const pick = (day: Date | undefined) => {
		onChange(day ? format(day, "yyyy-MM-dd") : "");
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					className={cn(
						"w-56 justify-start font-normal",
						!value && "text-muted-foreground"
					)}
				>
					<CalendarMinimalisticIcon className="size-4" />
					{value ? formatExamDate(value) : "Scegli la data"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					startMonth={new Date(2000, 0)}
					endMonth={future ? new Date(new Date().getFullYear() + 3, 11) : new Date()}
					disabled={future ? undefined : { after: new Date() }}
					selected={selected}
					defaultMonth={selected}
					onSelect={pick}
				/>
				<div className="flex justify-between gap-2 border-t p-2">
					<Button
						variant="ghost"
						size="sm"
						disabled={!value}
						onClick={() => pick(undefined)}
					>
						Togli la data
					</Button>
					<Button variant="outline" size="sm" onClick={() => pick(new Date())}>
						Oggi
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
