"use client"

import { useState, useEffect } from 'react'
import { notFound, useParams } from "next/navigation"

import Quiz from "@/components/Quiz"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Loader from "@/components/Loader"
import AnimatedContent from "@/animations/AnimatedContent"

import iconMap from "@/lib/iconMap"
import QuizSection from "@/types/QuizSection"
import QuizClass from "@/types/QuizClass"
import QuizQuestion from "@/types/QuizQuestion"
import Breadcrumb from '@/components/Breadcrumbs'

export default function QuizPage() {
    const params = useParams()
    const [quizClass, setQuizClass] = useState<QuizClass>({} as QuizClass);
    const [section, setSection] = useState<QuizSection>({} as QuizSection);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params?.quizClass || !params?.section) {
            notFound();
        }

        const fetchData = async (quizClassId: string, sectionId: string) => {
            try {
                const response = await fetch(`/api/questions?classId=${quizClassId}&sectionId=${sectionId}`);
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || response.statusText);
                }

                const data = await response.json();
                const formattedData = {
                    ...data.section,
                    icon: iconMap[data.section.icon]
                };

                setQuizClass(data.quizClass);
                setSection(formattedData);
                setQuestions(data.questions);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        }

        fetchData(params.quizClass as string, params.section as string);
    }, [params]);

    if (loading) {
        return <Loader />;
    }

    const getQuiz = () => {
        if (!questions.length) {
            return <p className="text-red-500 text-xl">No questions found</p>;
        }
        return <Quiz section={section} questions={questions} quizClassId={quizClass.id || 'id'} />;
    }

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
    )
}