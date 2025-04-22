import { useQuery } from "@tanstack/react-query"
import QuizQuestion from "@/types/QuizQuestion"

const fetchQuestionById = async (questionId: string): Promise<QuizQuestion> => {
  const response = await fetch(`/api/admin/question?questionId=${questionId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch question data");
  }
  return response.json();
};

export function useQuestionData(questionId: string, isEnabled: boolean) {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: () => fetchQuestionById(questionId),
    enabled: isEnabled,
  });
}