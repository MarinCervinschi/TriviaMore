
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { useMobile } from "./use-mobile"
import iconMap from "@/lib/iconMap"
import QuizSection from "@/types/QuizSection"

interface QuizTabsContentProps {
    sections: QuizSection[]; 
    quizClassId: string | undefined;
}

export default function QuizTabsContent({ sections, quizClassId }: QuizTabsContentProps) {
    const isMobile = useMobile()
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
                  <TableRow>
                    <TableHead className="text-primary px-6 py-3 text-left text-sm font-semibold">Icon</TableHead>
                    <TableHead className="text-primary px-6 py-3 text-left text-sm font-semibold">Section</TableHead>
                    <TableHead className="text-primary px-6 py-3 text-right text-sm font-semibold md:table-cell hidden">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {sections.map((section, index) => {
                    const href = `/${quizClassId}/${section.id}`
                    return (
                      <TableRow
                        key={section.id}
                        className={`hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                          index % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-slate-50 dark:bg-slate-800/30"
                        }`}
                        onClick={() => {
                          if (isMobile) {
                            router.push(href)
                          }
                        }}
                      >
                        <TableCell className="px-6 py-4 text-xl">{iconMap[section.icon || "default"]}</TableCell>
                        <TableCell className="px-6 py-4 font-medium">{section.sectionName}</TableCell>
                        <TableCell className="px-6 py-4 text-right md:table-cell hidden">
                          <Button
                            asChild
                            variant="outline"
                            className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-secondary/20 dark:border-secondary/40 hover:text-white dark:hover:text-secondary-foreground transition-all"
                          >
                            <Link href={href}>Start Quiz</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow
                    className="bg-gradient-to-r from-primary/5 to-secondary/20 hover:from-primary/10 hover:to-secondary/30 dark:from-primary/20 dark:to-secondary/30 dark:hover:from-primary/30 dark:hover:to-secondary/40 cursor-pointer"
                    onClick={() => {
                      if (isMobile) {
                        router.push(`/${quizClassId}/random`)
                      }
                    }}
                  >
                    <TableCell className="px-6 py-4 text-xl">{iconMap["FaRandom"]}</TableCell>
                    <TableCell className="px-6 py-4 font-medium">Random Mix</TableCell>
                    <TableCell className="px-6 py-4 text-right md:table-cell hidden">
                      <Button
                        asChild
                        variant="default"
                        className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                      >
                        <Link href={`/${quizClassId}/random`}>11 Questions</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
    )

}