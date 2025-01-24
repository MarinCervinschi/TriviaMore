'use client'

import DefaultLayout from "./components/Layouts/DefaultLayout"
import ClassSelector from "@components/ClassSelector"
import quizData from "@/lib/quiz-data"

export default function Home() {
  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-9">Welcome to the Quiz App</h1>
        <ClassSelector classes={quizData} />
      </div>
    </DefaultLayout>
  )
}
