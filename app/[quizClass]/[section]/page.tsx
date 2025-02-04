"use client"

import { useState, useEffect } from 'react'
import { notFound, useParams } from "next/navigation"
import { BiLogOut } from "react-icons/bi";
import Link from 'next/link'

import { Quiz } from "@components/quiz/Quiz"
import DefaultLayout from "@components/Layouts/DefaultLayout"
import Loader from '@components/Loader'
import SplitText from '@components/animation/SplitText';

import iconMap from '@/lib/iconMap'
import QuizSection from "@/types/QuizSection"
import QuizClass from "@/types/QuizClass"
import QuizQuestion from '@/types/QuizQuestion'

export default function QuizPage() {
    const params = useParams()
    const [quizClass, setQuizClass] = useState<QuizClass>({} as QuizClass);
    const [section, setSection] = useState<QuizSection>({} as QuizSection);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

    useEffect(() => {
        if (!params?.quizClass || !params?.section) {
            notFound();
        }

        const fetchData = async (quizClassId: string, sectionId: string) => {
            try {
                const response = await fetch(`/api/class/${quizClassId}/section/${sectionId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

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
            } catch (error) {
                console.error(error);
            }
        }

        fetchData(params.quizClass as string, params.section as string);
    }, [params]);

    if (!section || !questions.length) {
        return <Loader />;
    }

    return (
        <DefaultLayout>
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="flex items-center justify-center space-x-4">
                    <Link href={`/${quizClass.id}`} className="text-3xl hover:scale-110 active:text-red-600">
                        <BiLogOut />
                    </Link>
                    <SplitText
                        text={quizClass.name}
                        className="text-3xl font-bold text-center"
                        delay={50}
                        animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                        easing={(t: number) => t}
                        threshold={0.2}
                        rootMargin="-50px"
                    />
                </div>
                <Quiz section={section} questions={questions} quizClassId={quizClass.id} />
            </div>
        </DefaultLayout>
    )
}