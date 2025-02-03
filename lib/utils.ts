import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import QuizQuestion from "@/types/QuizQuestion";

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

export function getRandomQuestions(allQuestions: QuizQuestion[], count: number = 30): QuizQuestion[] {
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, count);
}