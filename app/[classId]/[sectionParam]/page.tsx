'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'

import Quiz from "@/components/Quiz"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Loader from "@/components/Loader"
import AnimatedContent from "@/animations/AnimatedContent"
import Breadcrumb from '@/components/Breadcrumbs'
import { FlashCard } from '@/components/FlashCard'

import { useQuizPageData } from '@/hooks/useQuizPageData'

export default function QuizPage({params}: { params: Promise<{ classId: string, sectionParam: string }> }) {
    const { classId, sectionParam } = use(params);
    
    const { data, isLoading, isError, error } = useQuizPageData(classId!, sectionParam!);

    if (!classId || !sectionParam) {
        notFound();
    }

    if (isLoading) return <Loader />;
    if (isError) return <p className="text-red-500 text-xl">Error: {error.message}</p>;

    const { quizClass, section, questions, flashCard } = data!;

    const getQuiz = () => {
        if (!questions.length) {
            return <p className="text-red-500 text-xl">No questions found</p>;
        }
        return flashCard
            ? <FlashCard section={section} questions={questions} quizClassId={quizClass.id} />
            : <Quiz section={section} questions={questions} quizClassId={quizClass.id} />;
    };

    return (
        <DefaultLayout>
            <div className="flex flex-col items-center justify-center w-full h-full min-h-[calc(100vh-4rem)] space-y-4">
                <Breadcrumb pages={[quizClass.name, section.sectionName]} url={`/${quizClass.id}`} />
                <AnimatedContent
                    distance={150}
                    direction="vertical"
                    reverse={false}
                    config={{ tension: 80, friction: 20 }}
                    initialOpacity={0.2}
                    animateOpacity
                    scale={1.1}
                    threshold={0.2}
                >
                    {getQuiz()}
                </AnimatedContent>
            </div>
        </DefaultLayout>
    );
}