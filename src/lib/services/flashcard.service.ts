import { prisma } from "../prisma";
import {
	FlashcardSection,
	FlashcardSession,
	FlashcardSessionRequest,
	StartFlashcardRequest,
} from "../types/flashcard.types";
import { UserService } from "./user.service";

export class FlashcardService extends UserService {
	static async generateGuestFlashcardSession(
		params: FlashcardSessionRequest
	): Promise<{ session: FlashcardSession }> {
		const { sectionId, cardCount = 10 } = params;

		const sectionData = await prisma.section.findFirst({
			where: {
				id: sectionId,
				isPublic: true,
			},
			include: {
				questions: {
					where: {
						questionType: "SHORT_ANSWER",
					},
				},
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
			throw new Error(
				"Sezione non trovata o nessuna domanda disponibile per le flashcard"
			);
		}

		const selectedQuestions = FlashcardService.selectRandomItems(
			sectionData.questions,
			cardCount
		);

		const flashcardSection: FlashcardSection = {
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

		const questions = selectedQuestions.map((q: any, index: number) => ({
			id: q.id,
			content: q.content,
			questionType: q.questionType,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation || undefined,
			difficulty: q.difficulty,
			order: index + 1,
		}));

		const session: FlashcardSession = {
			id: `guest-flashcard-${Date.now()}`,
			section: flashcardSection,
			questions,
			currentQuestionIndex: 0,
			isComplete: false,
		};

		return { session };
	}

	static async startFlashcardSession(
		params: StartFlashcardRequest
	): Promise<{ sessionId: string }> {
		const { userId, sectionId, cardCount = 10 } = params;

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error("Utente non trovato");
		}

		const sectionData = await prisma.section.findFirst({
			where: {
				id: sectionId,
			},
			include: {
				questions: {
					where: {
						questionType: "SHORT_ANSWER",
					},
				},
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

		if (!sectionData) {
			throw new Error("Sezione non trovata o accesso negato");
		}

		if (sectionData.questions.length === 0) {
			throw new Error("Nessuna domanda disponibile per le flashcard");
		}

		const timestamp = Date.now();
		const sessionId = `user-flashcard-${userId}-${timestamp}-${Buffer.from(`${sectionId}:${cardCount}`).toString("base64")}`;

		return { sessionId };
	}

	static async startExamSimulationSession(params: {
		userId: string;
		classId: string;
		cardCount?: number;
	}): Promise<{ sessionId: string }> {
		const { userId, classId, cardCount = 20 } = params;

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error("Utente non trovato");
		}

		const permissions = await super.getUserPermissions(userId);
		const whereClause = await super.getSectionWhereClause(classId, permissions);

		const classData = await prisma.class.findFirst({
			where: {
				id: classId,
			},
			include: {
				sections: {
					where: whereClause,
					include: {
						questions: {
							where: {
								questionType: "SHORT_ANSWER",
							},
						},
					},
				},
				course: {
					include: {
						department: true,
					},
				},
			},
		});

		if (!classData) {
			throw new Error("Classe non trovata");
		}

		const totalQuestions = classData.sections.reduce(
			(acc, section) => acc + section.questions.length,
			0
		);

		if (totalQuestions === 0) {
			throw new Error("Nessuna domanda disponibile per la simulazione");
		}

		const timestamp = Date.now();
		const sessionId = `exam-flashcard-${userId}-${timestamp}-${Buffer.from(`${classId}:${cardCount}`).toString("base64")}`;

		return { sessionId };
	}

	static async getUserFlashcardSession(
		userId: string,
		sessionId: string
	): Promise<{ session: FlashcardSession }> {
		// Estrai i parametri dall'ID sessione
		const sessionData = FlashcardService.parseSessionId(sessionId);

		if (!sessionData) {
			throw new Error("Sessione non valida");
		}

		const { sectionId, cardCount, timestamp } = sessionData;

		const sectionData = await prisma.section.findFirst({
			where: {
				id: sectionId,
			},
			include: {
				questions: {
					where: {
						questionType: "SHORT_ANSWER",
					},
				},
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

		if (!sectionData) {
			throw new Error("Sezione non trovata o accesso negato");
		}

		const selectedQuestions = FlashcardService.selectRandomItemsWithSeed(
			sectionData.questions,
			cardCount,
			timestamp
		);

		const flashcardSection: FlashcardSection = {
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

		const questions = selectedQuestions.map((q: any, index: number) => ({
			id: q.id,
			content: q.content,
			questionType: q.questionType,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation || undefined,
			difficulty: q.difficulty,
			order: index + 1,
		}));

		const session: FlashcardSession = {
			id: sessionId,
			section: flashcardSection,
			questions,
			currentQuestionIndex: 0,
			isComplete: false,
		};

		return { session };
	}

	static async getExamSimulationSession(
		userId: string,
		sessionId: string
	): Promise<{ session: FlashcardSession }> {
		const sessionData = FlashcardService.parseExamSessionId(sessionId);

		if (!sessionData) {
			throw new Error("Sessione non valida");
		}

		const { classId, cardCount, timestamp } = sessionData;

		const permissions = await super.getUserPermissions(userId);
		const whereClause = await super.getSectionWhereClause(classId, permissions);

		const classData = await prisma.class.findFirst({
			where: {
				id: classId,
			},
			include: {
				sections: {
					where: whereClause,
					include: {
						questions: {
							where: {
								questionType: "SHORT_ANSWER",
							},
						},
					},
				},
				course: {
					include: {
						department: true,
					},
				},
			},
		});

		if (!classData) {
			throw new Error("Classe non trovata");
		}

		const allQuestions = classData.sections.flatMap(section =>
			section.questions.map(question => ({
				...question,
				sectionName: section.name,
			}))
		);

		if (allQuestions.length === 0) {
			throw new Error("Nessuna domanda disponibile per la simulazione");
		}

		const selectedQuestions = FlashcardService.selectRandomItemsWithSeed(
			allQuestions,
			cardCount,
			timestamp
		);

		const flashcardSection: FlashcardSection = {
			id: classData.id,
			name: `Simulazione d'esame - ${classData.name}`,
			class: {
				name: classData.name,
				course: {
					name: classData.course.name,
					department: {
						name: classData.course.department.name,
					},
				},
			},
		};

		const questions = selectedQuestions.map((q: any, index: number) => ({
			id: q.id,
			content: q.content,
			questionType: q.questionType,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation || undefined,
			difficulty: q.difficulty,
			order: index + 1,
		}));

		const session: FlashcardSession = {
			id: sessionId,
			section: flashcardSection,
			questions,
			currentQuestionIndex: 0,
			isComplete: false,
		};

		return { session };
	}

	private static selectRandomItems<T>(array: T[], count: number): T[] {
		if (count >= array.length) {
			return FlashcardService.shuffleArray(array);
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

	private static selectRandomItemsWithSeed<T>(
		array: T[],
		count: number,
		seed: number
	): T[] {
		const rng = FlashcardService.seededRandom(seed);

		if (count >= array.length) {
			return FlashcardService.shuffleArrayWithRng(array, rng);
		}

		const selected: T[] = [];
		const indices = new Set<number>();

		while (selected.length < count) {
			const randomIndex = Math.floor(rng() * array.length);
			if (!indices.has(randomIndex)) {
				indices.add(randomIndex);
				selected.push(array[randomIndex]);
			}
		}

		return selected;
	}

	private static shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	private static shuffleArrayWithRng<T>(array: T[], rng: () => number): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	private static seededRandom(seed: number): () => number {
		let x = Math.sin(seed) * 10000;
		return () => {
			x = Math.sin(x) * 10000;
			return x - Math.floor(x);
		};
	}

	private static parseSessionId(
		sessionId: string
	): { sectionId: string; cardCount: number; timestamp: number } | null {
		try {
			// Formato: user-flashcard-{userId}-{timestamp}-{base64EncodedParams}
			const parts = sessionId.split("-");
			if (parts.length < 5 || parts[0] !== "user" || parts[1] !== "flashcard") {
				return null;
			}

			const timestamp = parseInt(parts[3]);
			if (isNaN(timestamp)) {
				return null;
			}

			// Decodifica i parametri dalla parte base64
			const encodedParams = parts[4];
			const decodedParams = Buffer.from(encodedParams, "base64").toString("utf-8");
			const [sectionId, cardCountStr] = decodedParams.split(":");

			const cardCount = parseInt(cardCountStr) || 10;

			return {
				sectionId,
				cardCount,
				timestamp,
			};
		} catch (error) {
			console.error("Errore nel parsing dell'ID sessione:", error);
			return null;
		}
	}

	private static parseExamSessionId(
		sessionId: string
	): { classId: string; cardCount: number; timestamp: number } | null {
		try {
			// Formato: exam-flashcard-{userId}-{timestamp}-{base64EncodedParams}
			const parts = sessionId.split("-");
			if (parts.length < 5 || parts[0] !== "exam" || parts[1] !== "flashcard") {
				return null;
			}

			const timestamp = parseInt(parts[3]);
			if (isNaN(timestamp)) {
				return null;
			}

			// Decodifica i parametri dalla parte base64
			const encodedParams = parts[4];
			const decodedParams = Buffer.from(encodedParams, "base64").toString("utf-8");
			const [classId, cardCountStr] = decodedParams.split(":");

			const cardCount = parseInt(cardCountStr) || 20;

			return {
				classId,
				cardCount,
				timestamp,
			};
		} catch (error) {
			console.error("Errore nel parsing dell'ID sessione esame:", error);
			return null;
		}
	}
}
