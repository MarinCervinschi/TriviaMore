'use client'

import { use } from "react"
import { useClassData } from "@/hooks/useClassData"
import { useRouter } from "next/navigation"

import Loader from "@/components/Loader"
import EditClassCard from "@/components/admin/EditClassCard"
import AddClassForm from "@/components/admin/AddClassForm"
import SectionsCard from "@/components/admin/SectionsCard"
import DefaultLayout from "@/components/Layouts/DefaultLayout"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IoMdArrowRoundBack } from "react-icons/io"

export default function ManageClass({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params)
    const router = useRouter()
    const isNewClass = classId === "new"

    const { data, isLoading, isError, error } = useClassData(classId, !isNewClass)

    if (isLoading) return <Loader />
    if (isError) return <p className="text-red-500">Error: {error.message}</p>

    const { class: quizClass, sections, flashCards } = data!

    return (
        <DefaultLayout>
            <div className="w-full max-w-5xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex gap-2">
                        {isNewClass ? "Add New Class" : `Manage Class:`}
                    </h1>
                    <Button onClick={() => router.push("/admin/dashboard")}><IoMdArrowRoundBack /> Back</Button>
                </div>

                <Card className="mb-6">
                    <CardHeader><CardTitle>{isNewClass ? "Class Details" : "Edit Class"}</CardTitle></CardHeader>
                    <CardContent>
                        {isNewClass ? (
                            <AddClassForm />
                        ) : (
                            <EditClassCard classId={classId} quizClass={quizClass} />
                        )}
                    </CardContent>
                </Card>
                {!isNewClass && <SectionsCard classId={classId} sections={[...(sections || []), ...(flashCards || [])]} />}
            </div>
        </DefaultLayout>
    )
}