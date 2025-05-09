import QuizClass from "@/types/QuizClass"
import QuizSection from "@/types/QuizSection";
import { useQuery } from "@tanstack/react-query"

const fetchClassData = async (classId: string): Promise<{ class: QuizClass; sections: QuizSection[], flashCards: QuizSection[] }> => {
    const response = await fetch(`/api/sections?classId=${classId}`)
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(errorBody.message || "Failed to fetch class data");
        (error as any).status = response.status;
        throw error;
    }
    const data = await response.json()
    return {
        class: data.class,
        sections: data.sections,
        flashCards: data.flashCards,
    }
}

export const useClassData = (classId: string, isEnabled: boolean) => {
    return useQuery({
        queryKey: ['quiz-class-sections', classId],
        queryFn: () => fetchClassData(classId),
        enabled: isEnabled,
    })
}