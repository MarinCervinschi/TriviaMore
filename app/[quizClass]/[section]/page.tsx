"use client"

import { useState, useEffect } from 'react'
import { Quiz } from "@components/quiz/Quiz"
import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import DefaultLayout from "@components/Layouts/DefaultLayout"
import Link from 'next/link'
import { BiLogOut } from "react-icons/bi";
import QuizSection from "@/types/QuizSection"
import QuizClass from "@/types/QuizClass"
import QuizQuestion from '@/types/QuizQuestion'
import iconMap from '@/lib/iconMap'
import Loader from '@components/Loader'

export default function QuizPage() {
    const params = useParams()
    if (!params?.quizClass || !params?.section) {
        return notFound()
    }
    const [quizClass, setQuizClass] = useState<QuizClass>({} as QuizClass);
    const [section, setSection] = useState<QuizSection>({} as QuizSection);
    const [questions, setQuestions] = useState([] as QuizQuestion[]);

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
            console.log(data.section);
            const formattedData = {
                ...data.section,
                icon: iconMap[data.section.icon]
            };
            console.log(data.section);
            console.log(iconMap[data.section.icon]);

            setQuizClass(data.quizClass);
            setSection(formattedData);
            setQuestions(data.questions);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchData(params.quizClass as string, params.section as string);
    }, []);

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
                    <h1 className="text-3xl font-bold text-center">{quizClass.name}</h1>
                </div>
                <Quiz section={section} questions={questions} quizClassId={quizClass.id} />
            </div>
        </DefaultLayout>
    )
}