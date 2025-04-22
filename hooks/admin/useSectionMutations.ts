import QuizSection from '@/types/QuizSection';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const createSection = async (payload: QuizSection) => {
  const response = await fetch("/api/admin/section", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create section")
  }
  return response.json()
}

const updateSection = async (payload: QuizSection) => {
  const response = await fetch("/api/admin/section", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to update section")
  }
  return response.json()
}

const deleteSection = async (sectionId: string) => {
  const response = await fetch(`/api/admin/section?sectionId=${sectionId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete section")
  }
  return response.json()
}




export const useSectionMutations = (classId: string, sectionId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const createSectionMutation = useMutation({
    mutationFn: createSection,
    onSuccess: () => {
      toast.success("Section created successfully 🎉")
      queryClient.invalidateQueries({ queryKey: ['quiz-class-sections', classId] })
      router.push(`/admin/class/${classId}`)
    },
    onError: (error: Error) => {
      console.error("Error creating section:", error)
      toast.error(`Failed to create section: ${error.message}`)
    }
  });


  const updateSectionMutation = useMutation({
    mutationFn: updateSection,
    onSuccess: () => {
      toast.success("Section updated successfully 🎉")
      queryClient.invalidateQueries({ queryKey: ['quiz-class-sections', classId] })
      queryClient.invalidateQueries({ queryKey: ['quiz-page', classId, sectionId] })
      router.push(`/admin/class/${classId}`)
    },
    onError: (error: Error) => {
      console.error("Error updating section:", error)
      toast.error(`Failed to update section: ${error.message}`)
    }
  });

  const deleteSectionMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      toast.success("Section deleted successfully 🎉")
      queryClient.invalidateQueries({ queryKey: ['quiz-class-sections', classId] })
      queryClient.invalidateQueries({ queryKey: ['quiz-page', classId, sectionId] })
      router.push(`/admin/class/${classId}`)
    },
    onError: (error: Error) => {
      console.error("Error deleting section:", error)
      toast.error(`Failed to delete section: ${error.message}`)
    }
  });

  return {
    createSectionMutation,
    updateSectionMutation,
    deleteSectionMutation,
  };
};