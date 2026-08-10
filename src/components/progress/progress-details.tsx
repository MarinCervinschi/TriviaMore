import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { TargetIcon } from "@solar-icons/react/linear/target";

import {
	DataTable,
	createDataTableColumns,
	useDataTable,
} from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import type { OverallStats } from "@/hooks/useProgressData";
import type { UserProgress } from "@/lib/user/types";
import { formatThirtyScaleGrade, getGradeColor } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

const column = createDataTableColumns<UserProgress>();

const columns = [
	column.accessor("sectionName", {
		header: "Sezione",
		meta: { label: "Sezione", cellClassName: "min-w-[14rem] font-medium" },
	}),
	column.accessor("className", {
		header: "Insegnamento",
		meta: {
			label: "Insegnamento",
			align: "center",
			cellClassName: "text-muted-foreground min-w-[12rem] text-sm",
		},
	}),
	column.accessor("quizMode", {
		header: "Modalità",
		meta: { label: "Modalità", align: "center" },
		cell: ({ row }) => (
			<Badge
				variant={row.original.quizMode === "STUDY" ? "default" : "secondary"}
				className="rounded-full"
			>
				{row.original.quizMode === "STUDY" ? "Studio" : "Esame"}
			</Badge>
		),
	}),
	column.accessor("quizzesTaken", {
		header: "Quiz",
		meta: { label: "Quiz", align: "center", cellClassName: "font-medium" },
	}),
	column.accessor("averageScore", {
		header: "Media",
		meta: { label: "Media", align: "center", cellClassName: "font-bold" },
		cell: ({ row }) => (
			<span className={getGradeColor(row.original.averageScore ?? 0)}>
				{formatThirtyScaleGrade(row.original.averageScore ?? 0)}
			</span>
		),
	}),
	column.accessor("bestScore", {
		header: "Migliore",
		meta: { label: "Migliore", align: "center", cellClassName: "font-bold" },
		cell: ({ row }) => (
			<span className={getGradeColor(row.original.bestScore ?? 0)}>
				{formatThirtyScaleGrade(row.original.bestScore ?? 0)}
			</span>
		),
	}),
	column.accessor("totalTimeSpent", {
		header: "Tempo",
		meta: {
			label: "Tempo",
			align: "center",
			cellClassName: "text-muted-foreground text-sm",
		},
		cell: ({ row }) => formatTimeSpent(row.original.totalTimeSpent),
	}),
];

export function ProgressDetails({
	overallStats,
	progressData,
}: {
	overallStats: OverallStats;
	progressData: UserProgress[];
}) {
	return (
		<div className="space-y-6">
			{/* Summary cards — study vs exam side by side */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="bg-card relative overflow-hidden rounded-2xl border p-6">
					<div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/10 blur-[30px]" />
					<div className="relative space-y-4">
						<div className="flex items-center gap-2">
							<div className="rounded-xl bg-blue-500/10 p-2">
								<TargetIcon className="h-5 w-5 text-blue-500" />
							</div>
							<h3 className="font-bold">Studio</h3>
						</div>
						<div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
							<div>
								<p className="text-xl font-bold sm:text-2xl">
									{overallStats.totalStudyQuizzes}
								</p>
								<p className="text-muted-foreground text-xs">Quiz</p>
							</div>
							<div>
								<p
									className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.avgStudy)}`}
								>
									{formatThirtyScaleGrade(overallStats.avgStudy)}
								</p>
								<p className="text-muted-foreground text-xs">Media</p>
							</div>
							<div>
								<p
									className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.bestStudy)}`}
								>
									{formatThirtyScaleGrade(overallStats.bestStudy)}
								</p>
								<p className="text-muted-foreground text-xs">Migliore</p>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-card relative overflow-hidden rounded-2xl border p-6">
					<div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-yellow-500/10 blur-[30px]" />
					<div className="relative space-y-4">
						<div className="flex items-center gap-2">
							<div className="rounded-xl bg-yellow-500/10 p-2">
								<CupFirstIcon className="h-5 w-5 text-yellow-500" />
							</div>
							<h3 className="font-bold">Esame</h3>
						</div>
						<div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
							<div>
								<p className="text-xl font-bold sm:text-2xl">
									{overallStats.totalExamQuizzes}
								</p>
								<p className="text-muted-foreground text-xs">Quiz</p>
							</div>
							<div>
								<p
									className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.avgExam)}`}
								>
									{formatThirtyScaleGrade(overallStats.avgExam)}
								</p>
								<p className="text-muted-foreground text-xs">Media</p>
							</div>
							<div>
								<p
									className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.bestExam)}`}
								>
									{formatThirtyScaleGrade(overallStats.bestExam)}
								</p>
								<p className="text-muted-foreground text-xs">Migliore</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div>
				<h3 className="mb-3 text-lg font-bold">Tutti i record di progresso</h3>
				<ProgressTable progressData={progressData} />
			</div>
		</div>
	);
}

function ProgressTable({ progressData }: { progressData: UserProgress[] }) {
	const table = useDataTable({
		data: progressData,
		columns,
		getRowId: row => row.id,
		pageSize: Math.max(progressData.length, 1),
	});

	return <DataTable table={table} density="compact" showPagination={false} />;
}
