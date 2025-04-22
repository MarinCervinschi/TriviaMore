'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClassMutations } from "@/hooks/admin/useClassMutations"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import iconMap from "@/lib/iconMap"
import { MdOutlineCancel } from "react-icons/md"
import { IoMdCreate } from "react-icons/io"

import QuizClass from "@/types/QuizClass"

export default function AddClassForm() {

    const [classId, setClassId] = useState("")
    const [className, setClassName] = useState("")
    const [visibility, setVisibility] = useState(false)
    const [classIcon, setClassIcon] = useState("default")

    const [jsonData, setJsonData] = useState("")
    const [isJsonMode, setIsJsonMode] = useState(false)

    const router = useRouter()
    const { createClassMutation } = useClassMutations(classId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        let data: QuizClass

        if (isJsonMode) {
            try {
                data = JSON.parse(jsonData)
            } catch (err) {
                toast.error("Invalid JSON data. Please check and try again.")
                return
            }
        } else {
            data = {
                id: classId,
                name: className,
                visibility,
                icon: classIcon
            }
        }

        createClassMutation.mutate(data)
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
                    <>
                        <Label>Example:</Label>
                        <pre className="bg-gray-100 p-2 rounded">{`{
  "id": "web-development",
  "name": "Web Development",
  "visibility": true,
  "icon": "FaCode"
}`}</pre>
                        <div className="space-y-2">
                            <Label htmlFor="json-data">JSON Data</Label>
                            <Textarea
                                id="json-data"
                                value={jsonData}
                                onChange={(e) => setJsonData(e.target.value)}
                                placeholder="Enter JSON data for the new class"
                                rows={10}
                                required
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="class-id">Class ID</Label>
                            <Input
                                id="class-id"
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                placeholder="Enter class ID"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class-name">Class Name</Label>
                            <Input
                                id="class-name"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                placeholder="Enter class name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class-icon" className="flex gap-1 items-center">Class Icon {iconMap["default"]}</Label>
                            <Input
                                id="class-icon"
                                value={classIcon}
                                onChange={(e) => setClassIcon(e.target.value)}
                                placeholder="Enter icon key"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="class-visibility">Visible to Users</Label>
                                <Switch id="class-visibility" checked={visibility} onCheckedChange={setVisibility} />
                            </div>
                            <p className="text-sm text-gray-500">
                                {visibility ? "This class will be visible to all users" : "This class will be hidden from users"}
                            </p>
                        </div>
                    </>
                )}

                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push("/admin/dashboard")} type="button">
                        Cancel <MdOutlineCancel />
                    </Button>
                    <Button type="submit" disabled={createClassMutation.isPending}>
                        {createClassMutation.isPending ? "Creating..." : "Create Class"} <IoMdCreate />
                    </Button>
                </div>
            </div>
        </form>
    )
}