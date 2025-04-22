'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizPageData } from '@/hooks/useQuizPageData';

import { Button } from '@/components/ui/button';
import AddSectionForm from '@/components/admin/AddSectionForm';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import Loader from '@/components/Loader';
import QuestionsCard from '@/components/admin/QuestionsCard';
import EditSectionCard from '@/components/admin/EditSectionCard';

import { IoMdArrowRoundBack } from 'react-icons/io';

export default function ManageSection({ params }: { params: Promise<{ classId: string, sectionId: string }> }) {
    const { classId, sectionId } = use(params);
    const router = useRouter();
    const isNewSection = sectionId === 'new';

    const { data, isLoading, isError, error } = isNewSection
        ? { data: null, isLoading: false, isError: false, error: null }
        : useQuizPageData(classId, sectionId);

    if (isLoading) return <Loader />;
    if (isError) return <p className="text-red-500">Error: {error?.message}</p>;

    return (
        <DefaultLayout>
            <div className="w-full max-w-5xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex gap-1">
                        {isNewSection ? "Add new Section: " : "Manage Section:"}
                    </h1>
                    <Button onClick={() => router.push(`/admin/class/${classId}`)}>
                        <IoMdArrowRoundBack /> Back to Class
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Section Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isNewSection ? (
                            <AddSectionForm quizClassId={classId} />
                        ) : (
                            <EditSectionCard classId={classId} sectionId={sectionId} sectionData={data?.section} />
                        )}
                    </CardContent>
                </Card>
                {!isNewSection && <QuestionsCard classId={classId} sectionId={sectionId} questions={data?.questions || []} />}
            </div>
        </DefaultLayout>
    );
}