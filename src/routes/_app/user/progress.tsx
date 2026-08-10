import { useState } from "react";

import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ExamChart } from "@/components/progress/exam-chart";
import { ProgressDetails } from "@/components/progress/progress-details";
import { ProgressStats } from "@/components/progress/progress-stats";
import { SectionsComparison } from "@/components/progress/sections-comparison";
import { StudyChart } from "@/components/progress/study-chart";
import { ProgressSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { UserHero } from "@/components/user/user-hero";
import { useProgressData } from "@/hooks/useProgressData";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import { formatThirtyScaleGrade } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

export const Route = createFileRoute("/_app/user/progress")({
	loader: ({ context }) => context.queryClient.ensureQueryData(userQueries.progress()),
	head: () => seoHead({ title: "Progressi", noindex: true }),
	pendingComponent: ProgressSkeleton,
	component: ProgressPage,
});

function ProgressPage() {
	const { data: progressData } = useSuspenseQuery(userQueries.progress());
	const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

	const {
		studyProgress,
		overallStats,
		studyChartData,
		examChartData,
		radialData,
		totalTime,
	} = useProgressData(progressData);

	if (progressData.length === 0) {
		return (
			<div className="space-y-8 pb-8">
				<UserHero
					icon={GraphUpIcon}
					title="I miei progressi"
					description="Analizza le tue performance e i tuoi miglioramenti nel tempo"
				/>
				<div className="container space-y-6">
					<UserBreadcrumb current="Progressi" />
					<EmptyState
						icon={CupFirstIcon}
						title="Nessun progresso disponibile"
						description="Inizia a completare alcuni quiz per vedere i tuoi progressi qui!"
						actionLabel="Esplora i Corsi"
						actionHref="/browse"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={GraphUpIcon}
				title="I miei progressi"
				description="Analizza le tue performance e i tuoi miglioramenti nel tempo"
				stats={[
					{
						label: "quiz totali",
						value: overallStats.totalStudyQuizzes + overallStats.totalExamQuizzes,
					},
					{
						label: "media studio",
						value: formatThirtyScaleGrade(overallStats.avgStudy),
					},
					{
						label: "tempo totale",
						value: formatTimeSpent(totalTime),
					},
				]}
			/>

			<div className="container space-y-8">
				<UserBreadcrumb current="Progressi" />

				<ProgressStats
					overallStats={overallStats}
					totalTime={totalTime}
					radialData={radialData}
				/>

				{/* Tabs */}
				<div className="bg-muted/50 flex gap-2 rounded-2xl p-1">
					<button
						onClick={() => setActiveTab("overview")}
						className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
							activeTab === "overview"
								? "bg-background shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Panoramica
					</button>
					<button
						onClick={() => setActiveTab("details")}
						className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
							activeTab === "details"
								? "bg-background shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Dettaglio performance
					</button>
				</div>

				{activeTab === "overview" && (
					<div className="space-y-6">
						<StudyChart data={studyChartData} />
						<ExamChart data={examChartData} />
						<SectionsComparison studyProgress={studyProgress} />
					</div>
				)}

				{activeTab === "details" && (
					<ProgressDetails overallStats={overallStats} progressData={progressData} />
				)}
			</div>
		</div>
	);
}
