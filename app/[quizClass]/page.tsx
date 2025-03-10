'use client'

import { useState, useEffect } from 'react'
import { notFound, useParams } from "next/navigation"
import { BiLogOut } from "react-icons/bi"
import Link from 'next/link'

import SectionSelector from "@/components/SectionSelector"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Loader from "@/components/Loader"
import SplitText from "@/animations/SplitText"
import AnimatedContent from "@/animations/AnimatedContent"
import iconMap from "@/lib/iconMap"

import QuizClass from "@/types/QuizClass"
import QuizSection from "@/types/QuizSection"

export default function QuizClassPage() {
    const params = useParams();
    const [quizClass, setQuizClass] = useState<QuizClass>({} as QuizClass);
    const [sections, setSections] = useState<QuizSection[]>([] as QuizSection[]);
    const [loading, setLoading] = useState(true);
    const [nameNotFound, setNameNotFound] = useState(false);

    useEffect(() => {
        if (!params?.quizClass) {
            setNameNotFound(true);
            return;
        }
        const fetchSections = async (quizClassId: string) => {
            try {
                const response = await fetch(`/api/sections?classId=${quizClassId}`);
                if (!response.ok) {
                    setNameNotFound(true);
                    return;
                }

                const data = await response.json();
                const formattedData = data.sections.map((row: any) => ({
                    ...row,
                    icon: iconMap[row.icon]
                }));

                setQuizClass(data.class);
                setSections(formattedData);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        fetchSections(params.quizClass as string);
    }, [params]);

    if (loading) {
        if (nameNotFound) {
            notFound();
        }
        return <Loader />;
    }

    const getSectionSelector = () => {
        if (!sections.length) {
            return <p className="text-red-500 text-xl">No sections found</p>;
        }
        return <SectionSelector sections={sections} quizClassId={quizClass.id || 'id'} />;
    }


    return (
        <DefaultLayout>
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="flex items-center justify-center space-x-4">
                    <Link href={`/`} className="text-3xl hover:scale-110 active:text-red-600">
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
                    {getSectionSelector()}
                </AnimatedContent>
            </div>
        </DefaultLayout>
    )
}