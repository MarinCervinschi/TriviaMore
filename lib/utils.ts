import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import QuizQuestion from "@/types/QuizQuestion";
import QuizSection from "@/types/QuizSection";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffleArray(array: QuizQuestion[]): QuizQuestion[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getRandomQuestions(count: number = 30, sections: QuizSection[]): QuizSection {
  const allQuestions = sections.flatMap(section => section.questions);
  const shuffled = shuffleArray(allQuestions);
  const selected = shuffled.slice(0, count);

  return {
      id: "random",
      name: "Random Mix",
      questions: selected
  };
}