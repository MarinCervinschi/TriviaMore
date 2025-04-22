import QuizClass from "@/types/QuizClass"
import QuizSection from "@/types/QuizSection";
import { useQuery } from "@tanstack/react-query"

const fetchClassData = async (classId: string): Promise<{ class: QuizClass; sections: QuizSection[] }> => {
    const response = await fetch(`/api/sections?classId=${classId}`)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch class data")
    }
    const data = await response.json()
    return {
        class: data.class,
        sections: data.sections,
    }
}

export const useClassData = (classId: string, isEnabled: boolean) => {
    return useQuery({
        queryKey: ['quiz-class-sections', classId],
        queryFn: () => fetchClassData(classId),
        enabled: isEnabled,
    })
}