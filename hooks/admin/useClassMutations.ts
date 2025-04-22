import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import QuizClass from "@/types/QuizClass"

const createClass = async (quizClass: QuizClass) => {
    const res = await fetch("/api/admin/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizClass),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to create class")
    }
    return res.json();
};

const updateClass = async (quizClass: QuizClass) => {
    const res = await fetch("/api/admin/class", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizClass),
    });
    if (!res.ok) throw new Error("Failed to save class");
    return res.json();
};

const deleteClass = async (classId: string) => {
    const res = await fetch(`/api/admin/class?classId=${classId}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete class");
    return res.json();
};

export function useClassMutations(classId: string) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const createClassMutation = useMutation({
        mutationFn: createClass,
        onSuccess: () => {
            toast.success("Class created successfully 🎉");
            queryClient.invalidateQueries({ queryKey: ['quiz-classes'] });
            queryClient.invalidateQueries({ queryKey: ['quiz-class-sections', classId] });
            router.push("/admin/dashboard");
        },
        onError: (err: Error) => {
            toast.error("Failed to create class. " + err.message);
        }
    });

    const updateClassMutation = useMutation({
        mutationFn: updateClass,
        onSuccess: () => {
            toast.success("Class updated successfully 🎉");
            queryClient.invalidateQueries({ queryKey: ['quiz-classes'] });
            queryClient.invalidateQueries({ queryKey: ['quiz-class-sections', classId] });
        },
        onError: () => {
            toast.error("Failed to update class");
        }
    });

    const deleteClassMutation = useMutation({
        mutationFn: deleteClass,
        onSuccess: () => {
            toast.success("Class deleted successfully 🎉");
            queryClient.invalidateQueries({ queryKey: ['quiz-classes'] });
            queryClient.invalidateQueries({ queryKey: ['quiz-class-sections', classId] });
            router.push("/admin/dashboard");
        },
        onError: () => {
            toast.error("Failed to delete class");
        }
    });

    return { createClassMutation, updateClassMutation, deleteClassMutation };
}