'use client'

import SectionSelector from "@components/quiz/SectionSelector"
import DefaultLayout from "../components/Layouts/DefaultLayout"
import quizData from "@/lib/quiz-data"
import { notFound } from "next/navigation"
import { useParams } from "next/navigation"
import { BiLogOut } from "react-icons/bi";
import Link from 'next/link'


export default function QuizClassPage() {
    const params = useParams()
    const quizClass = quizData.find((c) => c.id === params.quizClass)
    if (!quizClass) {
        notFound()
    }

    return (
        <DefaultLayout>
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="flex items-center justify-center space-x-4">
                    <Link href={`/`} className="text-3xl hover:scale-110 active:text-red-600">
                        <BiLogOut/>
                    </Link>
                    <h1 className="text-3xl font-bold text-center">{quizClass.name}</h1>
                </div>
                <SectionSelector sections={quizClass.sections} quizClassId={quizClass.id} />
            </div>
        </DefaultLayout>
    )
}

