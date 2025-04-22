import QuizClass from "@/types/QuizClass"
import { useQuery } from "@tanstack/react-query"

const fetchClasses = async (): Promise<QuizClass[]> => {
  const response = await fetch("/api/classes")
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch classes")
  }
  return response.json()
}

export const useClassesData = () => {
    return useQuery({
        queryKey: ['quiz-classes'],
        queryFn: fetchClasses,
    });
}