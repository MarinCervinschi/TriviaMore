'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useClassMutations } from "@/hooks/admin/useClassMutations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import iconMap from "@/lib/iconMap"
import { getVisibility } from "@/components/admin/utils"
import { MdOutlineCancel } from "react-icons/md"
import { FiEdit3, FiDelete } from "react-icons/fi"

import QuizClass from "@/types/QuizClass"
import { LuSave } from "react-icons/lu"
import IconSelector from "@/components/IconSelector"

interface EditClassCardProps {
    classId: string
    quizClass: QuizClass | undefined
}

export default function EditClassCard({ classId, quizClass }: EditClassCardProps) {
    const [editMode, setEditMode] = useState(false)
    const [className, setClassName] = useState("")
    const [classIcon, setClassIcon] = useState("default")
    const [visibility, setVisibility] = useState(false)
    const router = useRouter()

    const { updateClassMutation, deleteClassMutation } = useClassMutations(classId);

    useEffect(() => {
        if (quizClass) {
            setClassName(quizClass.name);
            setClassIcon(quizClass.icon || "default");
            setVisibility(quizClass.visibility);
        }
    }, [quizClass]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateClassMutation.mutate({
            id: classId,
            name: className,
            icon: classIcon,
            visibility
        });
        setEditMode(updateClassMutation.isPending);
    };

    const handleDeleteClass = () => {
        if (!confirm("Are you sure you want to delete this class?")) return;
        deleteClassMutation.mutate(classId);
    };

    return editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input id="class-name" value={className} onChange={(e) => setClassName(e.target.value)} />
                <Label htmlFor="class-icon">Class Icon</Label>
                <IconSelector selectedIcon={classIcon} onSelectIcon={setClassIcon} />
                <div className="flex justify-between items-center">
                    <Label htmlFor="class-visibility">Visibility</Label>
                    <Switch id="class-visibility" checked={visibility} onCheckedChange={setVisibility} />
                </div>
            </div>
            <div className="space-x-2">
                <Button type="submit" disabled={updateClassMutation.isPending}>
                    Save {updateClassMutation.isPending ? "..." : <LuSave />}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>Cancel <MdOutlineCancel /></Button>
            </div>
        </form>
    ) : (
        <div className="space-y-4">
            <p className="flex gap-1">
                <strong>Name:</strong> <span className="flex gap-1 items-center">{iconMap[classIcon]}{className}</span>
            </p>
            {getVisibility(visibility)}
            <div className="flex justify-between items-center">
                <div className="space-x-2">
                    <Button onClick={() => setEditMode(true)}>Edit <FiEdit3 /></Button>
                    <Button variant="destructive" onClick={handleDeleteClass}>Delete <FiDelete /></Button>
                </div>
                <Button variant="outline" onClick={() => router.push(`/${classId}`)}> Go to Class</Button>
            </div>
        </div>
    );
}