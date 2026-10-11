import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { academicYearOf, formatAcademicYear } from "@/lib/catalog/academic-year";

// A single-cycle degree lasts six years, plus two years behind schedule.
const YEARS_SHOWN = 8;

/** The academic year the student enrolled in, which picks their cohort's study plan. */
export function StartYearSelect({
	value,
	onChange,
	disabled,
	className,
	id,
}: {
	value: number | null;
	onChange: (year: number) => void;
	disabled?: boolean;
	className?: string;
	id?: string;
}) {
	const current = academicYearOf(new Date());
	const years = Array.from({ length: YEARS_SHOWN }, (_, i) => current - i);

	return (
		<Select
			value={value === null ? undefined : String(value)}
			onValueChange={year => onChange(Number(year))}
			disabled={disabled}
		>
			<SelectTrigger id={id} className={className}>
				<SelectValue placeholder="Scegli l'anno" />
			</SelectTrigger>
			<SelectContent>
				{years.map(year => (
					<SelectItem key={year} value={String(year)}>
						{formatAcademicYear(year)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
