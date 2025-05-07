'use client'

import { use } from 'react'
import { BiLogOut } from 'react-icons/bi'
import Link from 'next/link'

import SectionSelector from "@/components/SectionSelector"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Loader from "@/components/Loader"
import SplitText from "@/animations/SplitText"
import AnimatedContent from "@/animations/AnimatedContent"

import { useClassData } from '@/hooks/useClassData'
import ErrorPage from '@/components/ErrorPage'

export default function ManageClass({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);

    const { data, isLoading, isError, error } = useClassData(classId, !!classId);

    if (!classId) {
        return <ErrorPage status={404} message="Class not found" backTo="/" />;
    }

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

    const { class: quizClass, sections, flashCards } = data!;

    return (
        <DefaultLayout>
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="flex items-center justify-center space-x-4">
                    <Link href={`/`} className="text-3xl hover:scale-110">
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
                    {sections.length ? (
                        <SectionSelector sections={sections} flashCards={flashCards} quizClassId={quizClass.id} />
                    ) : (
                        <p className="text-red-500 text-xl">No sections found</p>
                    )}
                </AnimatedContent>
            </div>
        </DefaultLayout>
    );
}