import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import QuizQuestion from "@/types/QuizQuestion"

const saveQuestions = async (data: QuizQuestion[]) => {
    const response = await fetch(`/api/admin/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const res = await response.json().catch(() => null)
        throw new Error(res?.message || "Failed to save question")
    }
    return response.json();
};

const deleteQuestion = async (questionId: string) => {
    const response = await fetch(`/api/admin/question?questionId=${questionId}`, {
        method: "DELETE",
    })

    if (!response.ok) {
        throw new Error("Failed to delete question")
    }
    return response.json()
}

export function useQuestionMutation(classId: string, sectionId: string, questionId?: string) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const saveQuestionMutaion = useMutation({
        mutationFn: saveQuestions,
        onSuccess: () => {
            if (questionId) {
                toast.success("Question updated successfully 🎉")
                queryClient.invalidateQueries({ queryKey: ['question', questionId] });
            } else {
                toast.success("Question created successfully 🎉")
            }
            queryClient.invalidateQueries({ queryKey: ['quiz-page', classId, sectionId] });
            router.push(`/admin/class/${classId}/section/${sectionId}`);
        },
        onError: (err: Error) => {
            toast.error("Failed to save question: " + err.message);
        }
    });

    const deleteQuestionMutation = useMutation({
        mutationFn: deleteQuestion,
        onSuccess: () => {
            toast.success("Question deleted successfully 🎉")
            queryClient.invalidateQueries({ queryKey: ['quiz-page', classId, sectionId] })
        },
        onError: (error: Error) => {
            console.error("Error deleting question:", error)
            toast.error(`Failed to delete question: ${error.message}`)
        }
    });

    return {
        saveQuestionMutaion,
        deleteQuestionMutation,
    }
}