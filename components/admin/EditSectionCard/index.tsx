'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSectionMutations } from "@/hooks/admin/useSectionMutations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { MdOutlineCancel } from "react-icons/md"
import { FiEdit3, FiDelete } from "react-icons/fi"

import { LuSave } from "react-icons/lu"
import iconMap from "@/lib/iconMap"
import QuizSection from "@/types/QuizSection"
import IconSelector from "@/components/IconSelector"

interface EditSectionCardProps {
    classId: string
    sectionId: string
    sectionData: QuizSection | undefined
}

export default function EditSectionCard({ classId, sectionId, sectionData }: EditSectionCardProps) {
    const [editMode, setEditMode] = useState(false)
    const [sectionName, setSectionName] = useState('');
    const [sectionIcon, setSectionIcon] = useState('default');
    const router = useRouter();

    const { updateSectionMutation, deleteSectionMutation } = useSectionMutations(classId, sectionId);

    useEffect(() => {
        if (sectionData) {
            setSectionName(sectionData.sectionName);
            setSectionIcon(sectionData.icon || 'default');
        }
    }, [sectionData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            id: sectionId,
            classId: classId,
            sectionName,
            icon: sectionIcon,
        };
        updateSectionMutation.mutate(payload);
        setEditMode(updateSectionMutation.isPending);
    };

    const handleDeleteSection = async () => {
        if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
        deleteSectionMutation.mutate(sectionId);
    };

    const iconNode = iconMap[sectionData?.icon || "default"];

    return editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="class-id">Class ID</Label>
                <Input id="class-id" value={classId} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="section-name">Section Name</Label>
                <Input id="section-name" value={sectionName} onChange={(e) => setSectionName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="section-icon">Section Icon</Label>
                <IconSelector selectedIcon={sectionIcon} onSelectIcon={setSectionIcon} />
            </div>
            <div className="space-x-2">
                <Button onClick={handleSubmit}>
                    Save {updateSectionMutation.isPending ? "..." : <LuSave />}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancel <MdOutlineCancel />
                </Button>
            </div>
        </form>
    ) : (
        <div className="space-y-4">
            <p className="flex gap-1">
                <strong>Name:</strong> <span className="flex gap-1 items-center">{iconNode}{sectionData?.sectionName}</span>
            </p>
            <div className="flex items-center justify-between">
                <div className="space-x-2">
                    <Button onClick={() => setEditMode(true)}>Edit <FiEdit3 /></Button>
                    <Button variant="destructive" onClick={handleDeleteSection}>
                        Delete <FiDelete />
                    </Button>
                </div>
                <Button variant="outline" onClick={() => router.push(`/${classId}/${sectionId}`)}>
                    Try it out
                </Button>
            </div>
        </div>
    );
}