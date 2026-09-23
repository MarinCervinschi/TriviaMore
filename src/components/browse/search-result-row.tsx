import { BookIcon } from "@solar-icons/react/linear/book";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import type { SearchClassResult, SearchCourseResult } from "@/lib/browse/types";
import { cn } from "@/lib/utils";

/**
 * One row of the unified search, in the two shapes the catalogue has. They share a
 * frame so a mixed list reads as one list: glyph, name, where it sits, then the
 * figures — and the glyph is what says which of the two you are looking at.
 */
function Row({
	to,
	params,
	glyph,
	glyphClass,
	name,
	context,
	children,
}: {
	to: string;
	params: Record<string, string>;
	glyph: React.ReactNode;
	glyphClass: string;
	name: string;
	context: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			to={to}
			params={params as never}
			className="bg-card border-border/50 hover:border-border focus-visible:ring-ring focus-visible:shadow-focus flex items-center gap-4 rounded-2xl border p-4 shadow-xs transition-colors outline-none focus-visible:ring-2"
		>
			<span
				className={cn(
					"flex size-9 shrink-0 items-center justify-center rounded-xl",
					glyphClass
				)}
			>
				{glyph}
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm font-semibold">{name}</span>
				<span className="text-muted-foreground mt-0.5 block truncate text-xs">
					{context}
				</span>
			</span>
			<span className="flex shrink-0 items-center gap-2">{children}</span>
		</Link>
	);
}

function Figure({ children }: { children: React.ReactNode }) {
	return <span className="text-muted-foreground text-xs">{children}</span>;
}

export function CourseResultRow({ course }: { course: SearchCourseResult }) {
	const type = COURSE_TYPE_CONFIG[course.courseType];
	const campus = course.location ? CAMPUS_LOCATION_CONFIG[course.location] : undefined;

	return (
		<Row
			to="/browse/$department/$course"
			params={{ department: course.department.code, course: course.code }}
			glyph={<DiplomaIcon className="size-[18px]" />}
			glyphClass="bg-primary/10 text-brand"
			name={course.name}
			context={[course.department.name, campus?.label].filter(Boolean).join(" · ")}
		>
			{type && (
				<Badge variant="outline" size="sm" className={type.className}>
					{type.label}
				</Badge>
			)}
			{course.cfu !== null && <Figure>{course.cfu} CFU</Figure>}
			<Figure>
				{course.classCount} {course.classCount === 1 ? "insegnamento" : "insegnamenti"}
			</Figure>
		</Row>
	);
}

export function ClassResultRow({ klass }: { klass: SearchClassResult }) {
	return (
		<Row
			to="/browse/$department/$course/$class"
			params={{
				department: klass.course.department.code,
				course: klass.course.code,
				class: klass.code,
			}}
			glyph={<BookIcon className="size-[18px]" />}
			glyphClass="bg-chart-2/10 text-chart-2-ink"
			name={klass.name}
			context={`${klass.course.name} · ${klass.classYear}º anno`}
		>
			<Badge variant={klass.mandatory ? "secondary" : "outline"} size="sm">
				{klass.mandatory ? "Obbligatorio" : "A scelta"}
			</Badge>
			{klass.cfu !== null && <Figure>{klass.cfu} CFU</Figure>}
			<Figure>
				{klass.sectionCount} {klass.sectionCount === 1 ? "sezione" : "sezioni"}
			</Figure>
		</Row>
	);
}
