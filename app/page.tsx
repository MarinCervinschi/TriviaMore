'use client'

import { useEffect, useState } from 'react'

import Loader from "@/components/Loader"
import ClassSelector from "@/components/ClassSelector"
import DefaultLayout from "@/components/Layouts/DefaultLayout"

import SplitText from "@/components/animations/SplitText";
import AnimatedContent from "@/components/animations/AnimatedContent"

import iconMap from "@/lib/iconMap"
import QuizClass from "@/types/QuizClass"

export default function Home() {
  const [quizData, setQuizData] = useState<QuizClass[]>([] as QuizClass[]);
  const [loading, setLoading] = useState(true);

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
        const formattedData = data
          .map((row: any) => ({
            ...row,
            icon: iconMap[row.icon]
          }));
        setQuizData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
    fetchQuizData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const getClassSelector = () => {
    if (!quizData.length) {
      return <p className="text-red-500 text-xl">No classes found</p>;
    }
    return <ClassSelector classes={quizData} />;
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <SplitText
          text="Welcome to the Trivia MORE!"
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-9"
          delay={50}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing={(t: number) => t}
          threshold={0.2}
          rootMargin="-50px"
        />
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
          {getClassSelector()}
        </AnimatedContent>
      </div>
    </DefaultLayout>
  )
}
