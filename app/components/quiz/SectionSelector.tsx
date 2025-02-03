import { Button } from "@components/ui/button"
import SectionSelectorProps from "@/types/SectionSelectorProps"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import Link from "next/link"
import iconMap from "@/lib/iconMap"

export default function SectionSelector({ sections, quizClassId }: SectionSelectorProps) {

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Select a Quiz Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${sections.length > 9 ? 'lg:grid-cols-3' : ''}`}>
          {sections.map((section) => (
            <Button key={section.id} asChild variant="outline" className="h-auto py-4 text-lg active:text-green-600">
              <Link href={`/${quizClassId}/${section.id}`}>{section.icon}{section.name}</Link>
            </Button>
          ))}
          <Button asChild variant="default" className="h-auto py-4 text-lg col-span-full">
            <Link href={`/${quizClassId}/random`}>{iconMap['FaRandom']} &nbsp; Random Mix (30 Questions)</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

