import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import SectionSelectorProps from "@/types/SectionSelectorProps"
import iconMap from "@/lib/iconMap"

export default function SectionSelector({ sections, quizClassId }: SectionSelectorProps) {

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Select a Quiz Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="quiz">Quiz Mode</TabsTrigger>
            <TabsTrigger value="flashcards">Flash Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="quiz" className="space-y-4">
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${sections.length > 9 ? 'lg:grid-cols-3' : ''}`}>
              {sections.map((section) => (
                <Button key={section.id} asChild variant="outline" className="h-auto py-4 text-lg">
                  <Link href={`/${quizClassId}/${section.id}`}>{section.icon}{section.sectionName}</Link>
                </Button>
              ))}
              <Button asChild variant="default" className="h-auto py-4 text-lg col-span-full">
                <Link href={`/${quizClassId}/random`}>{iconMap['FaRandom']} &nbsp; Random Mix (30 Questions)</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-4">
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${sections.length > 9 ? 'lg:grid-cols-3' : ''}`}>
              {sections.map((section) => (
                <Button key={section.id} asChild variant="outline" className="h-auto py-4 text-lg">
                  <Link href={`/${quizClassId}/${section.id}&flash`}>{section.icon}{section.sectionName}</Link>
                </Button>
              ))}
              <Button asChild variant="default" className="h-auto py-4 text-lg col-span-full">
                <Link href={`/${quizClassId}/random&flash`}>{iconMap['FaRandom']} &nbsp; Random Mix (30 Cards)</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

