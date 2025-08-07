import { QuizMode } from "@prisma/client";

import { prisma } from "../prisma";
import {
	CompleteQuizRequest,
	EvaluationMode,
	GuestQuizRequest,
	GuestQuizResponse,
	Quiz,
	QuizAttemptResponse,
	QuizResult,
	QuizSection,
	StartQuizRequest,
} from "../types/quiz.types";

export class QuizService {
	/**
	 * Genera un quiz per utenti anonimi basato sulla sezione specificata
	 */
	static async generateGuestQuiz(params: GuestQuizRequest): Promise<GuestQuizResponse> {
		const { sectionId, questionCount = 30, quizMode = QuizMode.STUDY } = params;

		const sectionData = await prisma.section.findFirst({
			where: {
				id: sectionId,
				isPublic: true,
			},
			include: {
				questions: true,
				class: {
					include: {
						course: {
							include: {
								department: true,
							},
						},
					},
				},
			},
		});

		if (!sectionData || sectionData.questions.length === 0) {
			throw new Error("Sezione non trovata o nessuna domanda disponibile");
		}

		const selectedQuestions = QuizService.selectRandomItems(
			sectionData.questions,
			questionCount
		);

		const defaultEvaluationMode = await prisma.evaluationMode.findFirst({
			where: { name: "Standard" },
		});

		if (!defaultEvaluationMode) {
			throw new Error("Modalità di valutazione non configurata");
		}

		const quizSection: QuizSection = {
			id: sectionData.id,
			name: sectionData.name,
			class: {
				name: sectionData.class.name,
				course: {
					name: sectionData.class.course.name,
					department: {
						name: sectionData.class.course.department.name,
					},
				},
			},
		};

		const evaluationMode: EvaluationMode = {
			name: defaultEvaluationMode.name,
			description: defaultEvaluationMode.description || undefined,
			correctAnswerPoints: defaultEvaluationMode.correctAnswerPoints,
			incorrectAnswerPoints: defaultEvaluationMode.incorrectAnswerPoints,
			partialCreditEnabled: defaultEvaluationMode.partialCreditEnabled,
		};

		const questions = selectedQuestions.map((q: any, index: number) => ({
			id: q.id,
			content: q.content,
			questionType: q.questionType,
			options: q.options as string[] | undefined,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation || undefined,
			difficulty: q.difficulty,
			order: index + 1,
		}));

		const quiz: Quiz = {
			id: `guest-${Date.now()}`,
			quizMode,
			section: quizSection,
			evaluationMode,
			questions,
		};

		return { quiz };
	}

	/**
	 * Avvia un quiz per un utente registrato
	 */
	static async startQuiz({}): Promise<void> {
		// TODO: Implementare la logica per avviare un quiz
	}

	/**
	 * Completa un quiz e salva i progressi
	 */
	static async completeQuiz({}): Promise<void> {
		// TODO: Implementare la logica per completare il quiz
	}

	/**
	 * Mescola casualmente un array usando l'algoritmo Fisher-Yates
	 */
	private static shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	/**
	 * Seleziona casualmente un numero specifico di elementi da un array
	 * Più efficiente del shuffle completo quando si vuole solo un subset
	 */
	private static selectRandomItems<T>(array: T[], count: number): T[] {
		if (count >= array.length) {
			return QuizService.shuffleArray(array);
		}

		const selected: T[] = [];
		const indices = new Set<number>();

		while (selected.length < count) {
			const randomIndex = Math.floor(Math.random() * array.length);
			if (!indices.has(randomIndex)) {
				indices.add(randomIndex);
				selected.push(array[randomIndex]);
			}
		}

		return selected;
	}

	/**
	 * Aggiorna i progressi dell'utente
	 */
	private static async updateUserProgress({}): Promise<void> {
		// TODO: Implementare la logica per aggiornare i progressi dell'utente
	}
}
