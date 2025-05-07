"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type SectionSelectorProps from "@/types/SectionSelectorProps"

import QuizTabsContent from "./QuizTabsContent"
import FlashcardsTabsContent from "./FlashcardsTabsContent"

export default function SectionSelector({ sections, flashCards, quizClassId }: SectionSelectorProps) {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">Quiz Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizTabsContent sections={sections} quizClassId={quizClassId} />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">Flash Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <FlashcardsTabsContent flashCards={flashCards} quizClassId={quizClassId} />
        </CardContent>
      </Card>
    </div>
  )
}