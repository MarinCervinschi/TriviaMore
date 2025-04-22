import QuizClass from "@/types/QuizClass"
import { useQuery } from "@tanstack/react-query"

const fetchClasses = async (): Promise<QuizClass[]> => {
  const response = await fetch("/api/classes")
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.message || "Failed to fetch classes");
    (error as any).status = response.status;
    throw error;
  }
  return response.json()
}

export const useClassesData = () => {
    return useQuery({
        queryKey: ['quiz-classes'],
        queryFn: fetchClasses,
    });
}