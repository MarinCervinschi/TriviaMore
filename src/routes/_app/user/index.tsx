import { useMemo, useState } from "react";

import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

import { AchievementStrip } from "@/components/achievements/achievement-strip";
import { PinnedAchievements } from "@/components/achievements/pinned-achievements";
import { refOf, toEntries } from "@/components/calendar/calendar-data";
import { CalendarDayCard } from "@/components/calendar/calendar-day-card";
import type { EntrySpan } from "@/components/calendar/calendar-model";
import {
	CalendarSheets,
	type SheetTarget,
	sheetFromQuick,
	sheetOf,
} from "@/components/calendar/calendar-sheets";
import { QuickCreate, useQuickSave } from "@/components/calendar/quick-create";
import { CareerCard } from "@/components/career/career-card";
import {
	DataTable,
	createDataTableColumns,
	useDataTable,
} from "@/components/data-table";
import { ProgressSummary } from "@/components/progress/progress-summary";
import { OpenAttemptStatus } from "@/components/quiz/open-attempt-banner";
import { SeeAllLink } from "@/components/shared/see-all-link";
import { UserDashboardSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivitySection } from "@/components/user/activity-section";
import { DashboardBoard } from "@/components/user/dashboard-board";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { achievementQueries } from "@/lib/achievements/queries";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { useUpdateTask } from "@/lib/crm/mutations";
import { crmQueries } from "@/lib/crm/queries";
import type { CalendarData } from "@/lib/crm/types";
import { quizQueries } from "@/lib/quiz/queries";
import type { OpenAttempt } from "@/lib/quiz/types";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import type { RecentClass } from "@/lib/user/types";
import { getDisplayName } from "@/lib/user/utils";

export const Route = createFileRoute("/_app/user/")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userQueries.profile()),
			context.queryClient.ensureQueryData(userQueries.studyStats()),
		]),
	head: () => seoHead({ title: "Dashboard", noindex: true }),
	pendingComponent: UserDashboardSkeleton,
	component: DashboardPage,
});

function DashboardPage() {
	const { data: profile } = useSuspenseQuery(userQueries.profile());
	const { data: studyStats } = useSuspenseQuery(userQueries.studyStats());
	const { data: openAttempt } = useQuery(quizQueries.openAttempt());
	// Not suspense and not in the loader, so this feature can never take the dashboard down.
	const { data: achievements } = useQuery(achievementQueries.all());
	const { data: enrollment, isSuccess: enrollmentLoaded } = useQuery(
		crmQueries.currentEnrollment()
	);
	const { data: career } = useQuery({
		...crmQueries.career(),
		enabled: Boolean(enrollment),
	});
	const { data: calendar } = useQuery(crmQueries.calendar());
	const today = useToday();

	if (!profile) return null;

	const displayName = getDisplayName(profile);

	return (
		<div className="container space-y-8 pt-6 pb-8">
			<div className="space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
					<div className="flex min-w-0 items-center gap-3">
						<h1 className="truncate text-2xl font-bold tracking-tight">
							Ciao, {displayName}
						</h1>
						{achievements && achievements.pinned.length > 0 && (
							<PinnedAchievements pinned={achievements.pinned} />
						)}
					</div>
				</div>

				<DashboardStatus
					openAttempt={openAttempt}
					askEnrollment={enrollmentLoaded && !enrollment}
				/>
			</div>

			{studyStats.length > 0 && <ProgressSummary daily={studyStats} />}

			<DashboardBoard
				calendar={
					calendar && today && <CalendarPanel calendar={calendar} today={today} />
				}
				career={
					enrollment &&
					career &&
					calendar &&
					today && <CareerCard career={career} next={nextSitting(calendar, today)} />
				}
				achievements={achievements && <AchievementStrip overview={achievements} />}
			/>

			{profile.recentClasses.length > 0 && (
				<RecentClassesSection classes={profile.recentClasses} />
			)}

			<ActivitySection
				attempts={profile.recentQuizAttempts}
				total={profile.stats.quizAttemptsCount}
			/>
		</div>
	);
}

/** The chosen appello still to come that is nearest. */
function nextSitting(calendar: CalendarData, today: string) {
	return (
		calendar.sittings
			.filter(row => row.chosen && !row.examPassed && row.date >= today)
			.sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
	);
}

function CalendarPanel({ calendar, today }: { calendar: CalendarData; today: string }) {
	const entries = useMemo(() => toEntries(calendar), [calendar]);
	const [quick, setQuick] = useState<EntrySpan | null>(null);
	const [sheet, setSheet] = useState<SheetTarget>(null);
	const quickSave = useQuickSave(() => setQuick(null));
	const { mutate: patchTask } = useUpdateTask();

	return (
		<>
			<CalendarDayCard
				entries={entries}
				today={today}
				onOpen={entry => setSheet(sheetOf(refOf(entry)))}
				onToggle={entry => {
					const ref = refOf(entry);
					if (ref.kind === "task") patchTask({ id: ref.id, done: !entry.done });
				}}
				onAdd={setQuick}
			/>
			<QuickCreate
				draft={quick}
				exams={calendar.exams.filter(exam => !exam.passed)}
				pending={quickSave.pending}
				onSave={quickSave.save}
				onMore={result => {
					setQuick(null);
					setSheet(sheetFromQuick(result));
				}}
				onClose={() => setQuick(null)}
			/>
			<CalendarSheets data={calendar} open={sheet} onClose={() => setSheet(null)} />
		</>
	);
}

/** The viewer's local day; null on the server, where the zone is not theirs. */
function useToday() {
	const hydrated = useIsHydrated();
	return hydrated ? format(new Date(), "yyyy-MM-dd") : null;
}

function DashboardStatus({
	openAttempt,
	askEnrollment,
}: {
	openAttempt: OpenAttempt | null | undefined;
	askEnrollment: boolean;
}) {
	if (!openAttempt && !askEnrollment) return null;

	return (
		<div className="bg-muted flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3.5 py-2 text-sm">
			{openAttempt && <OpenAttemptStatus attempt={openAttempt} />}

			{openAttempt && askEnrollment && (
				<span
					className="bg-muted-foreground/30 h-1 w-1 shrink-0 rounded-full"
					aria-hidden
				/>
			)}

			{askEnrollment && (
				<span className="flex min-w-0 flex-1 items-center gap-2">
					<DiplomaIcon className="text-muted-foreground size-4 shrink-0" />
					<span className="truncate">Non ci hai ancora detto cosa studi</span>
					<Button asChild size="sm" variant="outline" className="ms-auto shrink-0">
						<Link to="/onboarding">Completa il profilo</Link>
					</Button>
				</span>
			)}
		</div>
	);
}

function RecentClassesSection({ classes }: { classes: RecentClass[] }) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-brand eyebrow-lg">I tuoi insegnamenti</p>
					<h2 className="text-xl font-bold">Insegnamenti visti di recente</h2>
				</div>
				<SeeAllLink to="/user/classes" icon={DiplomaIcon}>
					Tutti gli insegnamenti
				</SeeAllLink>
			</div>

			<RecentClassesTable classes={classes} />
		</div>
	);
}

const recentClassColumn = createDataTableColumns<RecentClass>();

function recentClassParams(item: RecentClass) {
	return {
		department: item.departmentCode.toLowerCase(),
		course: item.courseCode.toLowerCase(),
		class: (item.classCode ?? "").toLowerCase(),
	};
}

const recentClassColumns = [
	recentClassColumn.accessor("className", {
		header: "Insegnamento",
		enableSorting: false,
		meta: { label: "Insegnamento", cellClassName: "min-w-[16rem]" },
		cell: ({ row }) => (
			<Link
				to="/browse/$department/$course/$class"
				params={recentClassParams(row.original)}
			>
				<span className="text-foreground group-hover:text-brand block font-medium transition-colors">
					{row.original.className}
				</span>
				<p className="text-muted-foreground mt-0.5 text-xs">
					{row.original.courseName}
				</p>
			</Link>
		),
	}),
	recentClassColumn.accessor("departmentCode", {
		header: "Dipartimento",
		enableSorting: false,
		meta: { label: "Dipartimento", align: "center" },
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original.departmentCode}
			</Badge>
		),
	}),
	recentClassColumn.accessor("courseType", {
		header: "Tipo",
		enableSorting: false,
		meta: { label: "Tipo", align: "center" },
		cell: ({ row }) => (
			<Badge
				className={`text-xs ${COURSE_TYPE_CONFIG[row.original.courseType]?.className ?? ""}`}
			>
				{COURSE_TYPE_CONFIG[row.original.courseType]?.label ?? row.original.courseType}
			</Badge>
		),
	}),
	recentClassColumn.accessor("classYear", {
		header: "Anno",
		enableSorting: false,
		meta: {
			label: "Anno",
			align: "center",
			cellClassName: "text-muted-foreground text-sm",
		},
	}),
];

function RecentClassesTable({ classes }: { classes: RecentClass[] }) {
	const table = useDataTable({
		data: classes,
		columns: recentClassColumns,
		getRowId: row => row.classId,
		pageSize: Math.max(classes.length, 1),
	});

	return (
		<DataTable
			table={table}
			showPagination={false}
			rowLink={row => (
				<Link
					to="/browse/$department/$course/$class"
					params={recentClassParams(row)}
					aria-label={`Apri ${row.className}`}
				/>
			)}
		/>
	);
}
