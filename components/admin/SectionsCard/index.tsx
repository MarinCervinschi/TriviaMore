
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdAddToPhotos, MdManageSearch } from "react-icons/md";
import QuizSection from "@/types/QuizSection";
import iconMap from "@/lib/iconMap";
import { getFlashCardVisibility } from "../utils";

interface ClassSectionsProps {
    classId: string;
    sections: QuizSection[];
}

export default function SectionsCard({ classId, sections }: ClassSectionsProps) {
    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Sections</CardTitle>
                </CardHeader>
                <CardContent>
                    {sections?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sections.map((section) => (
                                <Card key={section.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {iconMap[section.icon || "default"]} {section.sectionName}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <Link href={`/admin/class/${classId}/section/${section.id}`}>
                                                <Button>
                                                    Manage <MdManageSearch />
                                                </Button>
                                            </Link>
                                            {getFlashCardVisibility(section.flashCard)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500" >No sections found. Add one below.</p>
                    )}
                </CardContent>
            </Card>
            <Button asChild>
                <Link href={`/admin/class/${classId}/section/new`}>
                    Add New Section <MdAddToPhotos />
                </Link>
            </Button>
        </>
    );
}