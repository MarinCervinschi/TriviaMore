
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

    const res = await fetch(`/api/questions?classId=${quizClassId}&sectionId=${sectionId}`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || res.statusText);
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
        enabled: idEnabled
    });
}