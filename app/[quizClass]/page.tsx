'use client'

import { useState, useEffect } from 'react'
import SectionSelector from "@components/quiz/SectionSelector"
import DefaultLayout from "../components/Layouts/DefaultLayout"
import { notFound } from "next/navigation"
import { useParams } from "next/navigation"
import { BiLogOut } from "react-icons/bi";
import Link from 'next/link'
import QuizSection from '@/types/QuizSection'
import iconMap from '@/lib/iconMap'
import QuizClass from '@/types/QuizClass'
import Loader from '../components/Loader'

export default function QuizClassPage() {
    const [quizData, setQuizData] = useState([] as QuizClass[]);
    const [sections, setSections] = useState([] as QuizSection[]);
    const params = useParams();

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const fetchQuizData = async () => {
        try {
            const response = await fetch('/api/classes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch quiz data');
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

    const fetchSections = async (quizClassId: string) => {
        try {
            const response = await fetch(`/api/sections/${quizClassId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.log(response.statusText);
                throw new Error('Failed to fetch sections');
            }
            const data = await response.json();
            const formattedData = data.map((row: any) => ({
                ...row,
                icon: iconMap[row.icon]
            }));
            setSections(formattedData);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchQuizData();
    }, []);

    useEffect(() => {
        if (quizData.length) {
            const quizClass = quizData.find((c) => c.id === params?.quizClass);
            if (quizClass) {
                fetchSections(quizClass.id);
            }
        }
    }, [quizData, params?.quizClass]);

    if (!quizData.length || !sections.length) {
        return <Loader  />;
    } 

    const quizClass = quizData.find((c) => c.id === params?.quizClass);
    if (!quizClass) {
        return notFound();
    }

    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <DefaultLayout>
                    <div className="flex flex-col items-center justify-center p-4 space-y-4">
                        <div className="flex items-center justify-center space-x-4">
                            <Link href={`/`} className="text-3xl hover:scale-110 active:text-red-600">
                                <BiLogOut />
                            </Link>
                            <h1 className="text-3xl font-bold text-center">{quizClass.name}</h1>
                        </div>
                        <SectionSelector sections={sections} quizClassId={quizClass.id} />
                    </div>
                </DefaultLayout>
            )}
        </>
    )
}