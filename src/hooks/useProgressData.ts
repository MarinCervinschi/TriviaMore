import { useMemo } from "react"

import type { UserProgress } from "@/lib/user/types"


export type StudyChartItem = {
  name: string
  fullName: string
  averageScore: number
  bestScore: number
  className: string
}

export type ExamChartItem = {
  courseName: string
  averageScore: number
  quizzesTaken: number
}

export type RadialDataItem = {
  name: string
  value: number
  score: number
  fill: string
}

export type OverallStats = {
  totalStudyQuizzes: number
  totalExamQuizzes: number
  avgStudy: number
  avgExam: number
  bestStudy: number
  bestExam: number
}

export function useProgressData(progressData: UserProgress[]) {
  return useMemo(() => {
    const study = progressData.filter((p) => p.quiz_mode === "STUDY")
    const exam = progressData.filter(
      (p) => p.quiz_mode === "EXAM_SIMULATION",
    )

    const totalStudyQuizzes = study.reduce(
      (sum, p) => sum + p.quizzes_taken,
      0,
    )
    const totalExamQuizzes = exam.reduce(
      (sum, p) => sum + p.quizzes_taken,
      0,
    )

    const studyScores = study
      .map((p) => p.average_score ?? 0)
      .filter((s) => s > 0)
    const examScores = exam
      .map((p) => p.average_score ?? 0)
      .filter((s) => s > 0)

    const avgStudy =
      studyScores.length > 0
        ? studyScores.reduce((a, b) => a + b, 0) / studyScores.length
        : 0
    const avgExam =
      examScores.length > 0
        ? examScores.reduce((a, b) => a + b, 0) / examScores.length
        : 0

    const studyChart = study
      .map((p) => ({
        name: p.section_name.length > 20
          ? p.section_name.substring(0, 18) + "..."
          : p.section_name,
        fullName: p.section_name,
        averageScore: +(p.average_score ?? 0).toFixed(1),
        bestScore: +(p.best_score ?? 0).toFixed(1),
        className: p.class_name,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)

    const examByCourseName: Record<
      string,
      { courseName: string; averageScore: number; quizzesTaken: number }
    > = {}
    for (const p of exam) {
      const name = p.course_name
      examByCourseName[name] = {
        courseName: name,
        averageScore: +(p.average_score ?? 0).toFixed(1),
        quizzesTaken: p.quizzes_taken,
      }
    }

    const totalTimeAll = progressData.reduce(
      (sum, p) => sum + p.total_time_spent,
      0,
    )

    // Radial chart: overall average as percentage of 33
    const overallAvg =
      [...studyScores, ...examScores].length > 0
        ? [...studyScores, ...examScores].reduce((a, b) => a + b, 0) /
          [...studyScores, ...examScores].length
        : 0
    const radial = [
      {
        name: "Media",
        value: +((overallAvg / 33) * 100).toFixed(0),
        score: +overallAvg.toFixed(1),
        fill: overallAvg >= 27 ? "#22c55e" : overallAvg >= 18 ? "#d14124" : "#ef4444",
      },
    ]

    return {
      studyProgress: study,
      overallStats: {
        totalStudyQuizzes,
        totalExamQuizzes,
        avgStudy,
        avgExam,
        bestStudy: Math.max(...study.map((p) => p.best_score ?? 0), 0),
        bestExam: Math.max(...exam.map((p) => p.best_score ?? 0), 0),
      } satisfies OverallStats,
      studyChartData: studyChart,
      examChartData: Object.values(examByCourseName),
      radialData: radial,
      totalTime: totalTimeAll,
    }
  }, [progressData])
}
