"use client"

import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSectionMutations } from "@/hooks/admin/useSectionMutations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { MdOutlineCancel } from "react-icons/md"
import { IoMdCreate } from "react-icons/io"

import QuizSection from "@/types/QuizSection"

interface AddSectionFormProps {
    quizClassId: string
}

export default function AddSectionForm({ quizClassId }: AddSectionFormProps) {
    const [sectionId, setSectionId] = useState("")
    const [sectionName, setSectionName] = useState("")
    const [sectionIcon, setSectionIcon] = useState("default")
    
    const [jsonData, setJsonData] = useState("")
    const [isJsonMode, setIsJsonMode] = useState(false)
    const router = useRouter()

    const { createSectionMutation } = useSectionMutations(quizClassId, sectionId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        let data = {} as QuizSection

        if (isJsonMode) {
            try {
                data = JSON.parse(jsonData)
                // Ensure the classId can't be overridden from JSON
                data.classId = quizClassId
            } catch (error) {
                console.error("Invalid JSON:", error)
                toast.error("Invalid JSON data. Please check and try again.")
                return
            }
        } else {
            data = {
                id: sectionId,
                classId: quizClassId,
                sectionName: sectionName,
                icon: sectionIcon,
            }
        }

        createSectionMutation.mutate(data)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="input-mode">Input Mode:</Label>
                    <Button type="button" variant={isJsonMode ? "outline" : "default"} onClick={() => setIsJsonMode(false)}>
                        Form
                    </Button>
                    <Button type="button" variant={isJsonMode ? "default" : "outline"} onClick={() => setIsJsonMode(true)}>
                        JSON
                    </Button>
                </div>
                {isJsonMode ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Example:</Label>
                            <pre className="bg-gray-100 p-2 rounded text-wrap">
                                {`{
    "classId": "${quizClassId}", # disallow editing                    
    "id": "html-css",
    "sectionName": "HTML/CSS",
    "icon": "FaHtml5"
}`}
                            </pre>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="json-data">JSON Data</Label>
                            <Textarea
                                id="json-data"
                                value={jsonData}
                                onChange={(e) => setJsonData(e.target.value)}
                                placeholder="Enter JSON data for the new section"
                                rows={10}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="class-id">Class ID</Label>
                            <Input id="class-id" value={quizClassId} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="section-id">Section ID</Label>
                            <Input
                                id="section-id"
                                value={sectionId}
                                onChange={(e) => setSectionId(e.target.value)}
                                placeholder="Enter section ID (e.g., html-css)"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="section-name">Section Name</Label>
                            <Input
                                id="section-name"
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                                placeholder="Enter section name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="section-icon">Section Icon</Label>
                            <Input
                                id="section-icon"
                                value={sectionIcon}
                                onChange={(e) => setSectionIcon(e.target.value)}
                                placeholder="Enter icon name"
                                required
                            />
                        </div>
                    </>
                )}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/class/${quizClassId}`)}
                        disabled={createSectionMutation.isPending}
                    >
                        Cancel <MdOutlineCancel />
                    </Button>
                    <Button
                        type="submit"
                        disabled={createSectionMutation.isPending}
                    >
                        {createSectionMutation.isPending ? "Creating..." : "Create Section"} <IoMdCreate />
                    </Button>
                </div>
            </div>
        </form>
    )
}