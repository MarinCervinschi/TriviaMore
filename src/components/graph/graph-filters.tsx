import { useState } from "react";

import { AltArrowUpIcon } from "@solar-icons/react/linear/alt-arrow-up";
import { FilterIcon } from "@solar-icons/react/linear/filter";
import { AnimatePresence, motion } from "framer-motion";

import { CloseGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
	AREA_CONFIG,
	CAMPUS_LOCATION_CONFIG,
	COURSE_TYPE_CONFIG,
} from "@/lib/browse/constants";
import {
	type GraphFiltersState,
	isFiltersStateEmpty,
} from "@/lib/browse/graph-filters";
import type { CampusLocation, CourseType, DepartmentArea } from "@/lib/browse/types";
import { slideInRight, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface GraphFiltersProps {
	filters: GraphFiltersState;
	onChange: (next: GraphFiltersState) => void;
	visibleCounts: { departments: number; courses: number };
	totalCounts: { departments: number; courses: number };
}

const AREA_KEYS = Object.keys(AREA_CONFIG) as DepartmentArea[];
const COURSE_TYPE_KEYS = Object.keys(COURSE_TYPE_CONFIG) as CourseType[];
const CAMPUS_KEYS = Object.keys(CAMPUS_LOCATION_CONFIG) as CampusLocation[];

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
	const next = new Set(set);
	if (next.has(value)) next.delete(value);
	else next.add(value);
	return next;
}

export function GraphFilters({
	filters,
	onChange,
	visibleCounts,
	totalCounts,
}: GraphFiltersProps) {
	const prefersReduced = useReducedMotion();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	const isEmpty = isFiltersStateEmpty(filters);
	const variants = withReducedMotion(slideInRight, prefersReduced);
	const motionDuration = prefersReduced ? 0 : 0.25;

	const onToggleArea = (area: DepartmentArea) => {
		onChange({ ...filters, areas: toggleInSet(filters.areas, area) });
	};

	const onToggleCourseType = (type: CourseType) => {
		onChange({ ...filters, courseTypes: toggleInSet(filters.courseTypes, type) });
	};

	const onToggleCampus = (campus: CampusLocation) => {
		onChange({ ...filters, campuses: toggleInSet(filters.campuses, campus) });
	};

	const onReset = () => {
		onChange({
			areas: new Set(),
			campuses: new Set(),
			courseTypes: new Set(),
		});
	};

	const body = (
		<div className="space-y-5">
			<div className="text-muted-foreground text-xs">
				{isEmpty ? (
					<span>
						Nessun filtro attivo · {totalCounts.departments} dipartimenti ·{" "}
						{totalCounts.courses} corsi
					</span>
				) : (
					<span>
						<span className="text-foreground font-semibold">
							{visibleCounts.departments}
						</span>
						/{totalCounts.departments} dipartimenti ·{" "}
						<span className="text-foreground font-semibold">
							{visibleCounts.courses}
						</span>
						/{totalCounts.courses} corsi
					</span>
				)}
			</div>

			<FilterSection title="Area">
				<div role="group" aria-label="Filtra per area" className="flex flex-wrap gap-2">
					{AREA_KEYS.map(key => (
						<FilterChip
							key={key}
							active={filters.areas.has(key)}
							onClick={() => onToggleArea(key)}
							accent={AREA_CONFIG[key]?.accent}
						>
							{AREA_CONFIG[key]?.label ?? key}
						</FilterChip>
					))}
				</div>
			</FilterSection>

			<FilterSection title="Tipo corso">
				<div
					role="group"
					aria-label="Filtra per tipo corso"
					className="flex flex-wrap gap-2"
				>
					{COURSE_TYPE_KEYS.map(key => (
						<FilterChip
							key={key}
							active={filters.courseTypes.has(key)}
							onClick={() => onToggleCourseType(key)}
						>
							{COURSE_TYPE_CONFIG[key]?.label ?? key}
						</FilterChip>
					))}
				</div>
			</FilterSection>

			<FilterSection title="Campus">
				<div
					role="group"
					aria-label="Filtra per campus"
					className="flex flex-wrap gap-2"
				>
					{CAMPUS_KEYS.map(key => (
						<FilterChip
							key={key}
							active={filters.campuses.has(key)}
							onClick={() => onToggleCampus(key)}
						>
							{CAMPUS_LOCATION_CONFIG[key]?.label ?? key}
						</FilterChip>
					))}
				</div>
			</FilterSection>

			<Button
				variant="ghost"
				size="sm"
				onClick={onReset}
				disabled={isEmpty}
				aria-label="Reimposta filtri"
				className="w-full"
			>
				Reimposta filtri
			</Button>
		</div>
	);

	return (
		<>
			{/* Desktop floating panel (collapsible) */}
			<div className="pointer-events-none absolute top-4 right-4 z-10 hidden sm:top-6 sm:right-6 md:block">
				<AnimatePresence mode="wait" initial={false}>
					{collapsed ? (
						<motion.div
							key="collapsed"
							initial={prefersReduced ? false : { opacity: 0, scale: 0.85 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={prefersReduced ? undefined : { opacity: 0, scale: 0.85 }}
							transition={{ duration: motionDuration, ease: "easeOut" }}
							className="pointer-events-auto"
						>
							<Button
								size="icon"
								variant="outline"
								aria-label="Espandi filtri"
								onClick={() => setCollapsed(false)}
								className="bg-card/95 relative rounded-full shadow-lg backdrop-blur-sm"
							>
								<FilterIcon className="size-5" />
								{!isEmpty && (
									<span
										aria-hidden
										className="bg-primary ring-background absolute -top-1 -right-1 size-3 rounded-full ring-2"
									/>
								)}
							</Button>
						</motion.div>
					) : (
						<motion.aside
							key="panel"
							variants={variants}
							initial="hidden"
							animate="visible"
							exit={
								prefersReduced
									? undefined
									: { opacity: 0, x: 30, transition: { duration: motionDuration } }
							}
							className={cn(
								"pointer-events-auto w-72",
								"bg-card/95 rounded-2xl border p-4 shadow-lg backdrop-blur-sm sm:p-5"
							)}
							aria-label="Filtri grafo"
						>
							<div className="mb-4 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<FilterIcon className="text-primary size-4" aria-hidden />
									<h2 className="text-sm font-semibold tracking-tight">Filtri</h2>
								</div>
								<button
									type="button"
									onClick={() => setCollapsed(true)}
									aria-label="Riduci filtri"
									className={cn(
										"text-muted-foreground hover:text-foreground -mr-1 rounded-full p-1",
										"transition-colors",
										"focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
									)}
								>
									<AltArrowUpIcon className="size-4" />
								</button>
							</div>
							{body}
						</motion.aside>
					)}
				</AnimatePresence>
			</div>

			{/* Mobile trigger + Sheet */}
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetTrigger asChild>
					<Button
						size="icon"
						variant="outline"
						aria-label="Apri filtri"
						className={cn(
							"pointer-events-auto absolute top-4 right-4 z-10 rounded-full shadow-lg",
							"bg-card/95 backdrop-blur-sm md:hidden"
						)}
					>
						<FilterIcon className="size-5" />
						{!isEmpty && (
							<span
								aria-hidden
								className="bg-primary ring-background absolute -top-1 -right-1 size-3 rounded-full ring-2"
							/>
						)}
					</Button>
				</SheetTrigger>
				<SheetContent
					side="bottom"
					className="max-h-[85vh] overflow-y-auto rounded-t-2xl border-t"
				>
					<div className="mb-4 flex items-center gap-2">
						<FilterIcon className="text-primary size-4" aria-hidden />
						<h2 className="text-sm font-semibold tracking-tight">Filtri</h2>
					</div>
					{body}
				</SheetContent>
			</Sheet>
		</>
	);
}

function FilterSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
				{title}
			</h3>
			{children}
		</div>
	);
}

function FilterChip({
	active,
	onClick,
	children,
	accent,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
	accent?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
				"transition-colors duration-150",
				"focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
				active
					? "border-primary bg-primary text-primary-foreground shadow-sm"
					: "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
			)}
		>
			{accent && (
				<span
					aria-hidden
					className={cn(
						"size-2 rounded-full",
						active ? "bg-primary-foreground/80" : accent
					)}
				/>
			)}
			{children}
			{active && <CloseGlyph aria-hidden className="-mr-0.5 size-3 opacity-80" />}
		</button>
	);
}
