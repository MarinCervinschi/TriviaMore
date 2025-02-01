"use client"

import { Quiz } from "@components/quiz/Quiz"
import quizData from "@/lib/quiz-data"
import { getRandomQuestions } from "@/lib/utils"
import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import DefaultLayout from "@components/Layouts/DefaultLayout"
import Link from 'next/link'
import { BiLogOut } from "react-icons/bi";

export default function QuizPage() {
    const params = useParams()
    const quizClass = quizData.find((c) => c.id === params.quizClass)
    const section = quizClass?.sections.find((s) => s.id === params.section)

    if (!quizClass) {
        return notFound()
    }

    const quizSection = params.section === "random" ? getRandomQuestions(30, quizClass.sections) : section

    if (!quizSection) {
        return notFound()
    }

    return (
        <DefaultLayout>
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="flex items-center justify-center space-x-4">
                    <Link href={`/${params.quizClass}`} className="text-3xl hover:scale-110 active:text-red-600">
                        <BiLogOut/>
                    </Link>
                    <h1 className="text-3xl font-bold text-center">{quizClass.name}</h1>
                </div>
                <Quiz section={quizSection} questions={quizSection.questions} quizClassId={quizClass.id} />
            </div>
        </DefaultLayout>
    )
}

