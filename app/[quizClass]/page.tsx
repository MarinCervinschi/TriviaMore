'use client'

import { useState, useEffect } from 'react'
import { notFound, useParams } from "next/navigation"
import { BiLogOut } from "react-icons/bi";
import Link from 'next/link'

import SectionSelector from "@components/quiz/SectionSelector"
import DefaultLayout from "@components/Layouts/DefaultLayout"
import Loader from '@components/Loader'
import iconMap from '@/lib/iconMap'

import QuizClass from '@/types/QuizClass'
import QuizSection from '@/types/QuizSection'
import SplitText from '@components/animation/SplitText';

export default function QuizClassPage() {
    const params = useParams();
    const [quizClass, setQuizClass] = useState<QuizClass>({} as QuizClass);
    const [sections, setSections] = useState<QuizSection[]>([] as QuizSection[]);

    useEffect(() => {
        if (!params?.quizClass) {
            notFound();
        }
        const fetchSections = async (quizClassId: string) => {
            try {
                const response = await fetch(`/api/class/${quizClassId}`, {
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
                const formattedData = data.sections.map((row: any) => ({
                    ...row,
                    icon: iconMap[row.icon]
                }));

                setQuizClass(data.class);
                setSections(formattedData);
            } catch (error) {
                console.error(error);
            }
        }
        fetchSections(params.quizClass as string);
    }, [params]);

    if (!sections.length) {
        return <Loader />;
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
                <SectionSelector sections={sections} quizClassId={quizClass.id} />
            </div>
        </DefaultLayout>
    )
}