import { prisma } from "../prisma";
import {
	FlashcardSection,
	FlashcardSession,
	FlashcardSessionRequest,
	StartFlashcardRequest,
} from "../types/flashcard.types";
import { UserService } from "./user.service";

export class FlashcardService extends UserService {
	/**
	 * Genera una sessione di flashcard per utenti guest
	 */
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

	/**
	 * Avvia una sessione di flashcard per utenti autenticati
	 */
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
		// Crea un ID sessione che include i parametri codificati
		const sessionId = `user-flashcard-${userId}-${timestamp}-${Buffer.from(`${sectionId}:${cardCount}`).toString("base64")}`;

		return { sessionId };
	}

	/**
	 * Recupera una sessione di flashcard per utenti autenticati
	 */
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

		// Usa lo stesso timestamp per garantire lo stesso ordine random
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

	/**
	 * Seleziona casualmente un numero specifico di elementi da un array
	 */
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

	/**
	 * Seleziona casualmente elementi usando un seed per garantire consistenza
	 */
	private static selectRandomItemsWithSeed<T>(
		array: T[],
		count: number,
		seed: number
	): T[] {
		// Implementazione semplificata usando il seed come base per Math.random
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
	 * Mescola array con un generatore di numeri casuali custom
	 */
	private static shuffleArrayWithRng<T>(array: T[], rng: () => number): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	/**
	 * Generatore di numeri casuali con seed
	 */
	private static seededRandom(seed: number): () => number {
		let x = Math.sin(seed) * 10000;
		return () => {
			x = Math.sin(x) * 10000;
			return x - Math.floor(x);
		};
	}

	/**
	 * Parsa l'ID sessione per estrarre i parametri
	 */
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
}
