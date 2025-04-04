"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Loader from "@/components/Loader"
import AddClassForm from "@/components/admin/AddClassForm"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

import QuizSection from "@/types/QuizSection"
import iconMap from "@/lib/iconMap"

import { MdAddToPhotos, MdManageSearch, MdOutlineCancel } from "react-icons/md";
import { LuSave } from "react-icons/lu"
import { FiEdit3, FiDelete } from "react-icons/fi";
import { IoMdArrowRoundBack } from "react-icons/io"
import { getVisibility } from "../../utils"

export default function ManageClass() {
    const params = useParams() || notFound();
    const [classId, setClassId] = useState("")
    const [className, setClassName] = useState("")
    const [visibility, setVisibility] = useState(false)
    const [classIcon, setClassIcon] = useState("default")
    const [iconNode, setIconNode] = useState<React.ReactNode>()
    const [sections, setSections] = useState<QuizSection[]>([])
    const [isNewClass, setIsNewClass] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const response = await fetch(`/api/sections?classId=${params.classId}`)
                if (response.ok) {
                    const data = await response.json()
                    const formattedData = data.sections.map((row: any) => ({
                        ...row,
                        icon: iconMap[row.icon]
                    }));
                    setSections(formattedData)
                    setClassId(data.class.id)
                    setClassName(data.class.name)
                    setVisibility(data.class.visibility)
                    setClassIcon(data.class.icon)
                    setIconNode(iconMap[data.class.icon])
                    setLoading(false)
                } else {
                    throw new Error("Failed to fetch class data")
                }
            } catch (error) {
                console.error("Error fetching class data:", error)
                toast.error("Failed to load class data. Please try again.")
            }
        }

        if (params.classId === "new") {
            setIsNewClass(true)
            setLoading(false)
        } else {
            setClassId(params.classId as string)
            fetchClassData()
        }
    }, [params.classId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const quizClass = {
            id: classId,
            name: className,
            visibility: visibility,
            icon: classIcon,
        }

        try {
            const response = await fetch("/api/admin/class", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(quizClass),
            })

            if (response.ok) {
                toast.success(`Class ${isNewClass ? "created" : "updated"} successfully 🎉`)
                if (isNewClass) {
                    router.push("/admin/dashboard")
                } 
                setEditMode(false)
            } else {
                throw new Error(`Failed to ${isNewClass ? "create" : "update"} class`)
            }
        } catch (error) {
            console.error(`Error ${isNewClass ? "creating" : "updating"} class:`, error)
            toast.error(`Failed to ${isNewClass ? "create" : "update"} class. Please try again.`)
        }
    }

    const handleDeleteClass = async () => {
        if (confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
            try {
                const response = await fetch(`/api/admin/class?classId=${params.classId}`, {
                    method: "DELETE",
                })

                if (response.ok) {
                    toast.success("Class deleted successfully 🎉")
                    router.push("/admin/dashboard")
                } else {
                    throw new Error("Failed to delete class")
                }
            } catch (error) {
                console.error("Error deleting class:", error)
                toast.error("Failed to delete class. Please try again.")
            }
        }
    }

    if (loading) {
        return <Loader />
    }

    const editClass = () => {
        if (editMode) {
            return (<div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="class-name">Class Name</Label>
                    <Input id="class-name" value={className} onChange={(e) => setClassName(e.target.value)} />
                    <Label htmlFor="class-icon">Class Icon</Label>
                    <Input id="class-icon" value={classIcon} onChange={(e) => setClassIcon(e.target.value)} />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="class-visibility">visibility to Users</Label>
                            <Switch id="class-visibility" checked={visibility} onCheckedChange={setVisibility} />
                        </div>
                        <p className="text-sm text-gray-500">
                            {visibility ? "This class will be visibility to all users" : "This class will be hidden from users"}
                        </p>
                    </div>
                </div>
                <div className="space-x-2">
                    <Button onClick={handleSubmit}>Save <LuSave /></Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel <MdOutlineCancel />
                    </Button>
                </div>
            </div>
            )
        } else {
            return (
                <div className="space-y-4">
                    <p className="flex items-center gap-1">
                        <strong>Name:</strong> <span className="flex gap-1 items-center">{iconNode} {className}</span>
                    </p>
                    {getVisibility(visibility)}
                    <div className="space-x-2">
                        <Button onClick={() => setEditMode(true)}>Edit <FiEdit3 /></Button>
                        <Button variant="destructive" onClick={handleDeleteClass}>
                            Delete <FiDelete />
                        </Button>
                    </div>
                </div>
            )
        }
    }

    return (
        <DefaultLayout>
            <div className="w-full max-w-5xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex gap-1">{isNewClass ? "Add New Class" : `Manage Class:`}<span className="flex items-center gap-1">{iconNode}{className}</span></h1>
                    <Button onClick={() => router.push("/admin/dashboard")}><IoMdArrowRoundBack /> Back to Dashboard</Button>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{isNewClass ? "Class Details" : "Edit Class Details"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isNewClass && editClass()}
                        {isNewClass && <AddClassForm />}
                    </CardContent>
                </Card>

                {!isNewClass && (
                    <>
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Sections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sections && sections.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sections.map((section) => (
                                            <Card key={section.id}>
                                                <CardHeader>
                                                    <CardTitle><span className="flex gap-1 items-center">{section.icon} {section.sectionName}</span></CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Link href={`/admin/class/${params.classId}/section/${section.id}`}>
                                                        <Button>Manage <MdManageSearch /></Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500">No sections found. Add a new section below.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Button asChild>
                            <Link href={`/admin/class/${params.classId}/section/new`}>Add New Section <MdAddToPhotos /></Link>
                        </Button>
                    </>
                )}
            </div>
        </DefaultLayout>
    )
}

