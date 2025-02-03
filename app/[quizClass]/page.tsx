'use client'

import { useState, useEffect } from 'react'
import SectionSelector from "@components/quiz/SectionSelector"
import DefaultLayout from "../components/Layouts/DefaultLayout"
import { notFound } from "next/navigation"
import { useParams } from "next/navigation"
import { BiLogOut } from "react-icons/bi";
import Link from 'next/link'
import iconMap from '@/lib/iconMap'
import QuizClass from '@/types/QuizClass'
import Loader from '../components/Loader'

export default function QuizClassPage() {
    const params = useParams();
    if (!params?.quizClass) {
        return notFound();
    }
    const [quizClass, setQuizClass] = useState<QuizClass>({ id: '', name: '' });
    const [sections, setSections] = useState([]);

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

            setQuizClass({ id: data.class.id, name: data.class.name });
            setSections(formattedData);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchSections(params.quizClass as string);
    }, []);

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
                    <h1 className="text-3xl font-bold text-center">{quizClass.name}</h1>
                </div>
                <SectionSelector sections={sections} quizClassId={quizClass.id} />
            </div>
        </DefaultLayout>
    )
}