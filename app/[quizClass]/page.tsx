'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, notFound } from 'next/navigation'
import { BiLogOut } from 'react-icons/bi'
import Link from 'next/link'

import SectionSelector from "@/components/SectionSelector"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Loader from "@/components/Loader"
import SplitText from "@/animations/SplitText"
import AnimatedContent from "@/animations/AnimatedContent"
import iconMap from "@/lib/iconMap"

import QuizClass from "@/types/QuizClass"
import QuizSection from "@/types/QuizSection"

const fetchQuizClassAndSections = async (quizClassId: string) => {
    const res = await fetch(`/api/sections?classId=${quizClassId}`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Errore nel fetch delle sezioni');
    }

    const data = await res.json();
    const formattedSections = data.sections.map((row: any) => ({
        ...row,
        icon: iconMap[row.icon]
    }));

    return {
        class: data.class as QuizClass,
        sections: formattedSections as QuizSection[]
    };
};

export default function QuizClassPage() {
    const params = useParams();
    const quizClassId = params?.quizClass as string | undefined;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['quiz-class-sections', quizClassId],
        queryFn: () => fetchQuizClassAndSections(quizClassId!),
        enabled: !!quizClassId
    });

    if (!quizClassId || isError) {
        console.error('Error fetching quiz class and sections:', error);
        notFound();
    }

    if (isLoading) return <Loader />;

    const { class: quizClass, sections } = data!;

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
                        <SectionSelector sections={sections} quizClassId={quizClass.id} />
                    ) : (
                        <p className="text-red-500 text-xl">No sections found</p>
                    )}
                </AnimatedContent>
            </div>
        </DefaultLayout>
    );
}