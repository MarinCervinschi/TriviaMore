import { useMemo } from "react";

import type { UserProgress } from "@/lib/user/types";

export type StudyChartItem = {
	name: string;
	fullName: string;
	averageScore: number;
	bestScore: number;
	className: string;
};

export type ExamChartItem = {
	courseName: string;
	averageScore: number;
	quizzesTaken: number;
};

export type RadialDataItem = {
	name: string;
	value: number;
	score: number;
	fill: string;
};

export type OverallStats = {
	totalStudyQuizzes: number;
	totalExamQuizzes: number;
	avgStudy: number;
	avgExam: number;
	bestStudy: number;
	bestExam: number;
};

export function useProgressData(progressData: UserProgress[]) {
	return useMemo(() => {
		const study = progressData.filter(p => p.quizMode === "STUDY");
		const exam = progressData.filter(p => p.quizMode === "EXAM_SIMULATION");

		const totalStudyQuizzes = study.reduce((sum, p) => sum + p.quizzesTaken, 0);
		const totalExamQuizzes = exam.reduce((sum, p) => sum + p.quizzesTaken, 0);

		const studyScores = study.map(p => p.averageScore ?? 0).filter(s => s > 0);
		const examScores = exam.map(p => p.averageScore ?? 0).filter(s => s > 0);

		const avgStudy =
			studyScores.length > 0
				? studyScores.reduce((a, b) => a + b, 0) / studyScores.length
				: 0;
		const avgExam =
			examScores.length > 0
				? examScores.reduce((a, b) => a + b, 0) / examScores.length
				: 0;

		const studyChart = study
			.map(p => ({
				name:
					p.sectionName.length > 20
						? p.sectionName.substring(0, 18) + "..."
						: p.sectionName,
				fullName: p.sectionName,
				averageScore: +(p.averageScore ?? 0).toFixed(1),
				bestScore: +(p.bestScore ?? 0).toFixed(1),
				className: p.className,
			}))
			.sort((a, b) => b.averageScore - a.averageScore);

		const examByCourseName: Record<
			string,
			{ courseName: string; averageScore: number; quizzesTaken: number }
		> = {};
		for (const p of exam) {
			// A class detached from every course has no name to group under.
			const name = p.courseName;
			if (!name) continue;
			examByCourseName[name] = {
				courseName: name,
				averageScore: +(p.averageScore ?? 0).toFixed(1),
				quizzesTaken: p.quizzesTaken,
			};
		}

		const totalTimeAll = progressData.reduce((sum, p) => sum + p.totalTimeSpent, 0);

		// Radial chart: overall average as percentage of 33
		const overallAvg =
			[...studyScores, ...examScores].length > 0
				? [...studyScores, ...examScores].reduce((a, b) => a + b, 0) /
					[...studyScores, ...examScores].length
				: 0;
		const radial = [
			{
				name: "Media",
				value: +((overallAvg / 33) * 100).toFixed(0),
				score: +overallAvg.toFixed(1),
				fill: overallAvg >= 27 ? "#22c55e" : overallAvg >= 18 ? "#d14124" : "#ef4444",
			},
		];

		return {
			studyProgress: study,
			overallStats: {
				totalStudyQuizzes,
				totalExamQuizzes,
				avgStudy,
				avgExam,
				bestStudy: Math.max(...study.map(p => p.bestScore ?? 0), 0),
				bestExam: Math.max(...exam.map(p => p.bestScore ?? 0), 0),
			} satisfies OverallStats,
			studyChartData: studyChart,
			examChartData: Object.values(examByCourseName),
			radialData: radial,
			totalTime: totalTimeAll,
		};
	}, [progressData]);
}
