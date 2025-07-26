
import { useQuery } from '@tanstack/react-query';
import QuizClass from '@/types/QuizClass';
import QuizSection from '@/types/QuizSection';
import QuizQuestion from '@/types/QuizQuestion';

const fetchQuizPageData = async (quizClassId: string, sectionParam: string): Promise<{
    quizClass: QuizClass;
    section: QuizSection;
    questions: QuizQuestion[];
    flashCard: boolean;
}> => {
    const [sectionId, flashFlag] = sectionParam.split('%26');

    const res = await fetch(`/api/questions?classId=${quizClassId}&sectionId=${sectionId}&flash=${flashFlag ? 'true' : 'false'}`);
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const error = new Error(errorBody.message || "Failed to fetch quiz page data");
        (error as any).status = res.status;
        throw error;
    }

    const data = await res.json();

    return {
        quizClass: data.quizClass,
        section: data.section,
        questions: data.questions,
        flashCard: !!flashFlag
    };
};

export const useQuizPageData = (quizClassId: string, sectionParam: string, idEnabled: boolean) => {
    return useQuery({
        queryKey: ['quiz-page', quizClassId, sectionParam],
        queryFn: () => fetchQuizPageData(quizClassId, sectionParam),
        enabled: idEnabled,
        staleTime: Infinity
    });
}