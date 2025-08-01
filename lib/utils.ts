import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import QuizQuestion from "@/types/QuizQuestion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function serializeId(id: string): string {
  return id.toLocaleLowerCase().replace(" ", "-");
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomQuestions(allQuestions: QuizQuestion[], count: number = 11): QuizQuestion[] {
  const questions = [...allQuestions];
  const selected: QuizQuestion[] = [];
  console.log(`Selecting ${count} random questions from a pool of ${questions.length}.`);

  // Fisher-Yates shuffle with reservoir sampling
  for (let i = 0; i < count && i < questions.length; i++) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    [questions[randomIndex], questions[questions.length - 1]] =
      [questions[questions.length - 1], questions[randomIndex]];
    selected.push(questions.pop()!);
  }

  return selected;
}