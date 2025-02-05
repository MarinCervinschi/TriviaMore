'use client'

import { useEffect, useState } from 'react'

import DefaultLayout from "@components/Layouts/DefaultLayout"
import ClassSelector from "@components/ClassSelector"
import Loader from '@components/Loader'

import QuizClass from '@/types/QuizClass'
import iconMap from '@/lib/iconMap'

import SplitText from "@components/animation/SplitText";

export default function Home() {
  const [quizData, setQuizData] = useState<QuizClass[]>([] as QuizClass[]);

  useEffect(() => {
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
    fetchQuizData();
  }, []);

  if (!quizData.length) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <SplitText
          text="Welcome to the Trivia More!"
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-9"
          delay={50}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing={(t: number) => t}
          threshold={0.2}
          rootMargin="-50px"
        />
        <ClassSelector classes={quizData} />
      </div>
    </DefaultLayout>
  )
}
