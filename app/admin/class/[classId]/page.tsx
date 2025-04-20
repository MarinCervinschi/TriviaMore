'use client'

import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { use, useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Loader from "@/components/Loader"
import AddClassForm from "@/components/admin/AddClassForm"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

import { getVisibility } from "../../utils"
import iconMap from "@/lib/iconMap"
import { MdAddToPhotos, MdManageSearch, MdOutlineCancel } from "react-icons/md"
import { FiEdit3, FiDelete } from "react-icons/fi"
import { IoMdArrowRoundBack } from "react-icons/io"
import QuizClass from "@/types/QuizClass"
import QuizSection from "@/types/QuizSection"

// --- API Fetchers ---
const fetchClassData = async (classId: string) => {
    const response = await fetch(`/api/sections?classId=${classId}`)
    if (!response.ok) throw new Error("Failed to fetch class data")
    const data = await response.json()
    return {
        class: data.class as QuizClass,
        sections: data.sections as QuizSection[],
        iconNode: iconMap[data.class.icon || 'default'],
    }
}

const updateClass = async (quizClass: QuizClass) => {
    const res = await fetch("/api/admin/class", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizClass),
    })
    if (!res.ok) throw new Error("Failed to save class")
    return res.json()
}

const deleteClass = async (classId: string) => {
    const res = await fetch(`/api/admin/class?classId=${classId}`, {
        method: "DELETE"
    })
    if (!res.ok) throw new Error("Failed to delete class")
    return res.json()
}

export default function ManageClass({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params)
    const router = useRouter()
    const queryClient = useQueryClient()

    const isNewClass = classId === "new"
    const [editMode, setEditMode] = useState(false)
    const [className, setClassName] = useState("")
    const [classIcon, setClassIcon] = useState("default")
    const [visibility, setVisibility] = useState(false)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-class', classId],
        queryFn: () => fetchClassData(classId),
        enabled: !isNewClass,
    });
    
    useEffect(() => {
        if (data) {
            setClassName(data.class.name);
            setClassIcon(data.class.icon || "default");
            setVisibility(data.class.visibility);
        }
    }, [data]);
    
    useEffect(() => {
        if (isError) {
            toast.error("Failed to load class data");
        }
    }, [isError]);

    const updateClassMutation = useMutation({
        mutationFn: updateClass,
        onSuccess: () => {
            toast.success(`Class ${isNewClass ? "created" : "updated"} successfully 🎉`)
            queryClient.invalidateQueries({ queryKey: ['admin-classes'] })
            if (isNewClass) router.push("/admin/dashboard")
            setEditMode(false)
        },
        onError: () => toast.error(`Failed to ${isNewClass ? "create" : "update"} class`)
    })

    const deleteClassMutation = useMutation({
        mutationFn: deleteClass,
        onSuccess: () => {
            toast.success("Class deleted successfully 🎉")
            queryClient.invalidateQueries({ queryKey: ['admin-classes'] })
            router.push("/admin/dashboard")
        },
        onError: () => toast.error("Failed to delete class")
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateClassMutation.mutate({
            id: classId,
            name: className,
            icon: classIcon,
            visibility
        })
    }

    const handleDeleteClass = () => {
        if (!confirm("Are you sure you want to delete this class?")) return
        deleteClassMutation.mutate(classId)
    }

    if (isLoading) return <Loader />
    if (isError && !isNewClass) return notFound()

    const { sections, iconNode } = data || {}

    return (
        <DefaultLayout>
            <div className="w-full max-w-5xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex gap-2">
                        {isNewClass ? "Add New Class" : `Manage Class:`}
                        {!isNewClass && iconNode && <span className="flex gap-1 items-center">{iconNode}{className}</span>}
                    </h1>
                    <Button onClick={() => router.push("/admin/dashboard")}><IoMdArrowRoundBack /> Back</Button>
                </div>

                <Card className="mb-6">
                    <CardHeader><CardTitle>{isNewClass ? "Class Details" : "Edit Class"}</CardTitle></CardHeader>
                    <CardContent>
                        {isNewClass ? <AddClassForm /> : editMode ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="class-name">Class Name</Label>
                                    <Input id="class-name" value={className} onChange={(e) => setClassName(e.target.value)} />
                                    <Label htmlFor="class-icon">Class Icon</Label>
                                    <Input id="class-icon" value={classIcon} onChange={(e) => setClassIcon(e.target.value)} />
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="class-visibility">Visibility</Label>
                                        <Switch id="class-visibility" checked={visibility} onCheckedChange={setVisibility} />
                                    </div>
                                </div>
                                <div className="space-x-2">
                                    <Button type="submit" disabled={updateClassMutation.isPending}>Save</Button>
                                    <Button variant="outline" onClick={() => setEditMode(false)}>Cancel <MdOutlineCancel /></Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <p><strong>Name:</strong> {className}</p>
                                {getVisibility(visibility)}
                                <div className="space-x-2">
                                    <Button onClick={() => setEditMode(true)}>Edit <FiEdit3 /></Button>
                                    <Button variant="destructive" onClick={handleDeleteClass}>Delete <FiDelete /></Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {!isNewClass && (
                    <>
                        <Card className="mb-6">
                            <CardHeader><CardTitle>Sections</CardTitle></CardHeader>
                            <CardContent>
                                {sections?.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sections.map(section => (
                                            <Card key={section.id}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {iconMap[section.icon || 'default']} {section.sectionName}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Link href={`/admin/class/${classId}/section/${section.id}`}>
                                                        <Button>Manage <MdManageSearch /></Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No sections found. Add one below.</p>
                                )}
                            </CardContent>
                        </Card>
                        <Button asChild>
                            <Link href={`/admin/class/${classId}/section/new`}>
                                Add New Section <MdAddToPhotos />
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </DefaultLayout>
    )
}