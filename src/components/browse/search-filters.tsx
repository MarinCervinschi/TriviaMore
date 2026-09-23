import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { FilterIcon } from "@solar-icons/react/linear/filter";
import { MapPointIcon } from "@solar-icons/react/linear/map-point";

import type { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import type { BrowseDepartment } from "@/lib/browse/types";

export type SearchFilterValues = {
	dept?: string;
	campus?: string;
	type?: string;
	anno?: number;
	obbligatori?: boolean;
};

type Key = keyof SearchFilterValues;
type Option = { value: string; label: string };

type Facet = {
	key: Key;
	title: string;
	icon: Icon;
	options: Option[];
	/** Which of the two kinds this one narrows, when it is not both. */
	scope?: string;
	parse?: (value: string) => SearchFilterValues[Key];
};

/**
 * The catalogue's facets, each carrying what it narrows. Department and campus cut
 * both kinds; the rest belong to one — which is why picking a year empties the
 * courses, and naming the scope in the menu is what makes that legible.
 */
function facetsOf(departments: BrowseDepartment[], years: number[]): Facet[] {
	return [
		{
			key: "dept",
			title: "Dipartimento",
			icon: BuildingsIcon,
			options: departments.map(department => ({
				value: department.id,
				label: department.name,
			})),
		},
		{
			key: "campus",
			title: "Sede",
			icon: MapPointIcon,
			options: Object.entries(CAMPUS_LOCATION_CONFIG).map(([value, config]) => ({
				value,
				label: config.label,
			})),
		},
		{
			key: "type",
			title: "Tipo di corso",
			icon: DiplomaIcon,
			scope: "corsi",
			options: Object.entries(COURSE_TYPE_CONFIG).map(([value, config]) => ({
				value,
				label: config.label,
			})),
		},
		{
			key: "anno",
			title: "Anno",
			icon: CalendarIcon,
			scope: "insegnamenti",
			options: years.map(year => ({ value: String(year), label: `${year}º anno` })),
			parse: value => Number(value),
		},
		{
			key: "obbligatori",
			title: "Frequenza",
			icon: CheckCircleIcon,
			scope: "insegnamenti",
			options: [{ value: "true", label: "Solo obbligatori" }],
			parse: () => true,
		},
	];
}

/** The funnel: one submenu per facet, the shape the tables already use. */
export function SearchFilterMenu({
	values,
	departments,
	years,
	onChange,
}: {
	values: SearchFilterValues;
	departments: BrowseDepartment[];
	years: number[];
	onChange: (next: Partial<SearchFilterValues>) => void;
}) {
	const facets = facetsOf(departments, years);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{/* rounded-lg, not the Button default: at 32px a 16px radius is a circle. */}
				<Button
					variant="outline"
					size="sm"
					aria-label="Filtri"
					className="size-8 shrink-0 rounded-lg p-0"
				>
					<FilterIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				{facets.map(facet => (
					<DropdownMenuSub key={facet.key}>
						<DropdownMenuSubTrigger className="gap-2">
							<facet.icon className="text-muted-foreground size-4" />
							<span className="flex-1">{facet.title}</span>
							{facet.scope && (
								<span className="text-muted-foreground/70 text-2xs">{facet.scope}</span>
							)}
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="max-h-80 max-w-80 min-w-52 overflow-y-auto">
							{facet.options.map(option => {
								const on = String(values[facet.key] ?? "") === option.value;
								return (
									<DropdownMenuCheckboxItem
										key={option.value}
										checked={on}
										onSelect={event => event.preventDefault()}
										onCheckedChange={() =>
											onChange({
												[facet.key]: on
													? undefined
													: (facet.parse?.(option.value) ?? option.value),
											})
										}
									>
										<span className="min-w-0 flex-1 truncate">{option.label}</span>
									</DropdownMenuCheckboxItem>
								);
							})}
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * One removable chip per active facet. It renders a fragment so the chips share
 * their parent's wrapping flow — inside a wrapper of their own they took a line to
 * themselves and left whatever follows them stranded.
 */
export function SearchFilterChips({
	values,
	departments,
	years,
	onChange,
}: {
	values: SearchFilterValues;
	departments: BrowseDepartment[];
	years: number[];
	onChange: (next: Partial<SearchFilterValues>) => void;
}) {
	const active = facetsOf(departments, years).flatMap(facet => {
		const raw = values[facet.key];
		if (raw === undefined) return [];
		const option = facet.options.find(entry => entry.value === String(raw));
		return option ? [{ facet, label: option.label }] : [];
	});

	if (active.length === 0) return null;

	return (
		<>
			{active.map(({ facet, label }) => (
				<span
					key={facet.key}
					className="bg-muted text-foreground inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium"
				>
					<facet.icon className="text-muted-foreground size-3.5 shrink-0" />
					<span className="text-muted-foreground">{facet.title}</span>
					<span className="max-w-40 truncate">{label}</span>
					<button
						type="button"
						aria-label={`Togli il filtro ${facet.title}`}
						onClick={() => onChange({ [facet.key]: undefined })}
						className="hover:bg-background focus-visible:ring-ring ml-0.5 flex size-4 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2"
					>
						<span aria-hidden>×</span>
					</button>
				</span>
			))}
		</>
	);
}
