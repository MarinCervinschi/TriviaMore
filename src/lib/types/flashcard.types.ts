export interface FlashcardQuestion {
	id: string;
	content: string;
	correctAnswer: string[];
	explanation?: string;
	difficulty: "EASY" | "MEDIUM" | "HARD";
	order: number;
}

export interface FlashcardSection {
	id: string;
	name: string;
	class: {
		name: string;
		course: {
			name: string;
			department: {
				name: string;
			};
		};
	};
}

export interface FlashcardSession {
	id: string;
	section: FlashcardSection;
	questions: FlashcardQuestion[];
	currentQuestionIndex: number;
	isComplete: boolean;
}

export interface FlashcardSessionRequest {
	sectionId: string;
	cardCount?: number;
}

export interface StartFlashcardRequest {
	userId: string;
	sectionId: string;
	cardCount?: number;
}

// Interfaccia per le props del componente Flashcard
export interface FlashcardComponentProps {
	flashcardId: string;
	isGuest: boolean;
	user?: any;
}
