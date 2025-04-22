'use client'

import Loader from "@/components/Loader"
import ClassSelector from "@/components/ClassSelector"
import DefaultLayout from "@/components/Layouts/DefaultLayout"

import SplitText from "@/components/animations/SplitText";
import AnimatedContent from "@/components/animations/AnimatedContent"

import { useClassesData } from '@/hooks/useClassesData'
import ErrorPage from "@/components/ErrorPage";

export default function Home() {
  const { data: quizData, isLoading, isError, error } = useClassesData();

  if (isLoading) return <Loader />;
  if (isError) {
    const status = (error as any)?.status ?? 500;
  
    return (
      <ErrorPage
        status={status}
        message={error.message}
        backTo="/"
      />
    );
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
          {quizData?.length ? (
            <ClassSelector classes={quizData} />
          ) : (
            <p className="text-red-500 text-xl">No classes found</p>
          )}
        </AnimatedContent>
      </div>
    </DefaultLayout>
  );
}