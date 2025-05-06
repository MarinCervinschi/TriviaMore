
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useMobile } from "./use-mobile"
import iconMap from "@/lib/iconMap"
import QuizSection from "@/types/QuizSection"

interface FlashcardsTabsContentProps {
    sections: QuizSection[];
    quizClassId: string | undefined;
}

export default function FlashcardsTabsContent({ sections, quizClassId }: FlashcardsTabsContentProps) {
    const isMobile = useMobile()
    const router = useRouter()

    return (
        <TabsContent value="flashcards" className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                    <TableHeader className="bg-gradient-to-r from-muted/10 to-accent/10 dark:from-muted/20 dark:to-accent/20">
                        <TableRow>
                            <TableHead className="px-6 py-3 text-left text-sm font-semibold">Icon</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-semibold">Section</TableHead>
                            <TableHead className="px-6 py-3 text-right text-sm font-semibold md:table-cell hidden">
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border">
                        {sections.map((section, index) => {
                            const href = `/${quizClassId}/${section.id}&flash`
                            return (
                                <TableRow
                                    key={section.id}
                                    className={`hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${index % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-slate-50 dark:bg-slate-800/30"
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
                                            className="bg-gradient-to-r from-muted/10 to-accent/10 hover:from-muted/20 hover:to-accent/20 border-accent/20 dark:border-accent/40 hover:text-accent dark:hover:text-accent-foreground transition-all"
                                        >
                                            <Link href={href}>View Cards</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        <TableRow
                            className="bg-gradient-to-r from-muted/5 to-accent/20 hover:from-muted/10 hover:to-accent/30 dark:from-muted/20 dark:to-accent/30 dark:hover:from-muted/30 dark:hover:to-accent/40 cursor-pointer"
                            onClick={() => {
                                if (isMobile) {
                                    router.push(`/${quizClassId}/random&flash`)
                                }
                            }}
                        >
                            <TableCell className="px-6 py-4 text-xl">{iconMap["FaRandom"]}</TableCell>
                            <TableCell className="px-6 py-4 font-medium">Random Mix</TableCell>
                            <TableCell className="px-6 py-4 text-right md:table-cell hidden">
                                <Button
                                    asChild
                                    variant="default"
                                    className="bg-gradient-to-r from-accent to-destructive hover:from-accent/90 hover:to-destructive/90"
                                >
                                    <Link href={`/${quizClassId}/random&flash`}>30 Cards</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </TabsContent>
    )
}