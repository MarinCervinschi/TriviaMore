'use client'

import iconMap from '@/lib/iconMap'
import { useEffect, useState } from 'react'
import DefaultLayout from "./components/Layouts/DefaultLayout"
import ClassSelector from "@components/ClassSelector"
import QuizClass from '@/types/QuizClass'
import Loader from './components/Loader'

export default function Home() {
  const [quizData, setQuizData] = useState([] as QuizClass[]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch('/api/classes', {
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
      const formattedData = data.map((row: any) => ({
        ...row,
        icon: iconMap[row.icon]
      }));
      setQuizData(formattedData);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchQuizData();
  }, []);

  if (!quizData.length) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-9">Welcome to the Quiz App</h1>
        <ClassSelector classes={quizData} />
      </div>
    </DefaultLayout>
  )
}
