import type { questions } from "@/db/schema";

type QuestionRow = typeof questions.$inferSelect;

export type FlashcardQuestion = Pick<
	QuestionRow,
	"id" | "content" | "correctAnswer" | "explanation" | "difficulty"
> & {
	order: number;
};

export type FlashcardSection = {
	id: string;
	name: string;
	className: string;
	courseName: string | null;
	departmentName: string | null;
};

export type FlashcardSession = {
	id: string;
	section: FlashcardSection;
	questions: FlashcardQuestion[];
};
