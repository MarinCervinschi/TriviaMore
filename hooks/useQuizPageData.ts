
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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
    const [sectionId] = sectionParam.split('%26');
    const isRandom = sectionId === 'random';

    const randomKey = useMemo(() => Date.now(), []);

    return useQuery({
        queryKey: isRandom
            ? ['quiz-page-random', quizClassId, sectionParam, randomKey]
            : ['quiz-page', quizClassId, sectionParam],
        queryFn: () => fetchQuizPageData(quizClassId, sectionParam),
        enabled: idEnabled,
        staleTime: isRandom ? 0 : Infinity,
        gcTime: isRandom ? 0 : undefined,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false
    });
}