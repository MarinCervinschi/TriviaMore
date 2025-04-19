'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, notFound } from 'next/navigation'

import Quiz from "@/components/Quiz"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Loader from "@/components/Loader"
import AnimatedContent from "@/animations/AnimatedContent"
import Breadcrumb from '@/components/Breadcrumbs'
import { FlashCard } from '@/components/FlashCard'

import iconMap from "@/lib/iconMap"
import QuizSection from "@/types/QuizSection"
import QuizClass from "@/types/QuizClass"
import QuizQuestion from "@/types/QuizQuestion"

const fetchQuizPageData = async (quizClassId: string, sectionParam: string) => {
  const [sectionId, flashFlag] = sectionParam.split('%26');

  const res = await fetch(`/api/questions?classId=${quizClassId}&sectionId=${sectionId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || res.statusText);
  }

  const data = await res.json();

  return {
    quizClass: data.quizClass as QuizClass,
    section: {
      ...data.section,
      icon: iconMap[data.section.icon]
    } as QuizSection,
    questions: data.questions as QuizQuestion[],
    flashCard: !!flashFlag
  };
};

export default function QuizPage() {
  const params = useParams();
  const quizClassId = params?.quizClass as string | undefined;
  const sectionParam = params?.section as string | undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['quiz-page', quizClassId, sectionParam],
    queryFn: () => fetchQuizPageData(quizClassId!, sectionParam!),
    enabled: !!quizClassId && !!sectionParam
  });

  if (!quizClassId || !sectionParam || isError) {
    notFound();
  }

  if (isLoading) {
    return <Loader />;
  }

  const { quizClass, section, questions, flashCard } = data!;

  const getQuiz = () => {
    if (!questions.length) {
      return <p className="text-red-500 text-xl">No questions found</p>;
    }
    return flashCard
      ? <FlashCard section={section} questions={questions} quizClassId={quizClass.id} />
      : <Quiz section={section} questions={questions} quizClassId={quizClass.id} />;
  };

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
  );
}