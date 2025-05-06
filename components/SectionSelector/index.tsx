"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type SectionSelectorProps from "@/types/SectionSelectorProps"

import QuizTabsContent from "./QuizTabsContent"
import FlashcardsTabsContent from "./FlashcardsTabsContent"

export default function SectionSelector({ sections, quizClassId }: SectionSelectorProps) {

  return (
    <Card className="w-full max-w-5xl mx-auto ">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Select a Quiz Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
            <TabsTrigger
              value="quiz"
              className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground"
            >
              Quiz Mode
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-muted data-[state=active]:to-accent data-[state=active]:text-accent-foreground"
            >
              Flash Cards
            </TabsTrigger>
          </TabsList>

          <QuizTabsContent sections={sections} quizClassId={quizClassId} />
          <FlashcardsTabsContent sections={sections} quizClassId={quizClassId} />

        </Tabs>
      </CardContent>
    </Card>
  )
}