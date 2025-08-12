import { QuizMode } from "@prisma/client";

import { prisma } from "../prisma";
import {
	AnswerAttempt,
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
		const {
			sectionId,
			questionCount = 30,
			timeLimit = 30,
			quizMode = QuizMode.STUDY,
		} = params;

		const sectionData = await prisma.section.findFirst({
			where: {
				id: sectionId,
				isPublic: true,
			},
			include: {
				questions: {
					where: {
						// Filtra solo domande MULTIPLE_CHOICE e TRUE_FALSE per i quiz
						questionType: {
							in: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
						},
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
			throw new Error("Sezione non trovata o nessuna domanda disponibile per il quiz");
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
			options: q.options ? QuizService.shuffleArray(q.options as string[]) : undefined,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation || undefined,
			difficulty: q.difficulty,
			order: index + 1,
		}));

		const quiz: Quiz = {
			id: `guest-${Date.now()}`,
			timeLimit,
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
	static async startQuiz(params: StartQuizRequest): Promise<QuizAttemptResponse> {
		const {
			userId,
			sectionId,
			questionCount = 30,
			timeLimit = 30,
			quizMode,
			evaluationModeId,
		} = params;

		// Verifica che l'utente esista
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error("Utente non trovato");
		}

		let questions: any[] = [];
		let sectionData: any = null;
		let actualSectionId: string = sectionId; // ID sezione da usare nel database

		if (quizMode === "EXAM_SIMULATION") {
			// Per l'exam mode, prendiamo domande da tutte le sezioni della classe
			const classData = await prisma.class.findFirst({
				where: {
					id: sectionId, // In exam mode, sectionId è in realtà il classId
				},
				include: {
					sections: {
						where: {
							OR: [
								{ isPublic: true },
								{
									access: {
										some: {
											userId: userId,
										},
									},
								},
							],
						},
						include: {
							questions: {
								where: {
									questionType: {
										in: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
									},
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
				throw new Error("Classe non trovata o accesso negato");
			}

			// Trova o crea la sezione "exam" per questa classe
			let examSection = await prisma.section.findFirst({
				where: {
					classId: classData.id,
					name: "Exam Simulation",
				},
			});

			if (!examSection) {
				// Crea la sezione exam se non esiste
				examSection = await prisma.section.create({
					data: {
						name: "Exam Simulation",
						description: `Sezione per la simulazione d'esame della classe ${classData.name}`,
						classId: classData.id,
						isPublic: true,
					},
				});
			}

			// Usa l'ID della sezione exam per il database
			actualSectionId = examSection.id;

			// Raccogliamo tutte le domande da tutte le sezioni della classe
			questions = classData.sections.flatMap(section => section.questions);

			// Creiamo un oggetto sezione per mantenere la compatibilità
			sectionData = {
				id: examSection.id,
				name: `Esame Simulato - ${classData.name}`,
				description: `Quiz completo per la classe ${classData.name}`,
				class: classData,
				questions: questions,
			};
		} else {
			// Per lo study mode, manteniamo la logica esistente
			sectionData = await prisma.section.findFirst({
				where: {
					id: sectionId,
					OR: [
						{ isPublic: true },
						{
							access: {
								some: {
									userId: userId,
								},
							},
						},
					],
				},
				include: {
					questions: {
						where: {
							questionType: {
								in: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
							},
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

			questions = sectionData.questions;
		}

		if (questions.length === 0) {
			throw new Error("Nessuna domanda disponibile per il quiz");
		}

		// Verifica che la modalità di valutazione esista
		const evaluationMode = await prisma.evaluationMode.findUnique({
			where: { id: evaluationModeId },
		});

		if (!evaluationMode) {
			throw new Error("Modalità di valutazione non trovata");
		}

		// Seleziona le domande random
		const selectedQuestions = QuizService.selectRandomItems(questions, questionCount);

		// Crea il quiz nel database
		const quiz = await prisma.quiz.create({
			data: {
				timeLimit,
				sectionId: actualSectionId, // Usa l'ID della sezione corretta
				evaluationModeId,
				quizMode,
				questions: {
					create: selectedQuestions.map((question, index) => ({
						questionId: question.id,
						order: index + 1,
					})),
				},
			},
			include: {
				questions: {
					include: {
						question: true,
					},
					orderBy: {
						order: "asc",
					},
				},
				section: true,
				evaluationMode: true,
			},
		});

		// Crea il quiz attempt
		const quizAttempt = await prisma.quizAttempt.create({
			data: {
				userId,
				quizId: quiz.id,
				score: 0, // Sarà aggiornato al completamento
			},
		});

		// Prepara la risposta
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

		const evaluationModeResponse: EvaluationMode = {
			name: evaluationMode.name,
			description: evaluationMode.description || undefined,
			correctAnswerPoints: evaluationMode.correctAnswerPoints,
			incorrectAnswerPoints: evaluationMode.incorrectAnswerPoints,
			partialCreditEnabled: evaluationMode.partialCreditEnabled,
		};

		const formattedQuestions = quiz.questions.map(qq => ({
			id: qq.question.id,
			content: qq.question.content,
			questionType: qq.question.questionType,
			options: qq.question.options
				? QuizService.shuffleArray([...(qq.question.options as string[])])
				: undefined,
			correctAnswer: qq.question.correctAnswer,
			explanation: qq.question.explanation || undefined,
			difficulty: qq.question.difficulty,
			order: qq.order,
		}));

		const quizResponse: Quiz = {
			id: quiz.id,
			timeLimit: quiz.timeLimit || undefined,
			quizMode: quiz.quizMode,
			section: quizSection,
			evaluationMode: evaluationModeResponse,
			questions: formattedQuestions,
		};

		return {
			attemptId: quizAttempt.id,
			quiz: quizResponse,
		};
	}

	/**
	 * Completa un quiz e salva i progressi
	 */
	static async completeQuiz(params: CompleteQuizRequest): Promise<QuizResult> {
		const { userId, quizAttemptId, answers, timeSpent } = params;

		// Verifica che il quiz attempt esista e appartenga all'utente
		const quizAttempt = await prisma.quizAttempt.findFirst({
			where: {
				id: quizAttemptId,
				userId,
			},
			include: {
				quiz: {
					include: {
						questions: {
							include: {
								question: true,
							},
						},
						section: true,
						evaluationMode: true,
					},
				},
				answers: true,
			},
		});

		if (!quizAttempt) {
			throw new Error("Quiz attempt non trovato");
		}

		// Verifica che il quiz non sia già stato completato
		if (quizAttempt.answers.length > 0) {
			throw new Error("Quiz già completato");
		}

		// Calcola i punteggi e salva le risposte
		let totalScore = 0;
		let correctAnswers = 0;
		const savedAnswers: AnswerAttempt[] = [];

		for (const answer of answers) {
			// Trova la domanda corrispondente
			const quizQuestion = quizAttempt.quiz.questions.find(
				qq => qq.question.id === answer.questionId
			);

			if (!quizQuestion) {
				continue; // Salta risposte per domande non trovate
			}

			// Salva la risposta nel database
			const savedAnswer = await prisma.answerAttempt.create({
				data: {
					quizAttemptId,
					questionId: answer.questionId,
					userAnswer: answer.userAnswer,
					score: answer.score,
				},
			});

			totalScore += answer.score;
			if (answer.score > 0) {
				correctAnswers++;
			}

			savedAnswers.push({
				questionId: savedAnswer.questionId,
				userAnswer: savedAnswer.userAnswer,
				score: savedAnswer.score,
			});
		}

		// Aggiorna il quiz attempt con il punteggio finale e il tempo
		await prisma.quizAttempt.update({
			where: { id: quizAttemptId },
			data: {
				score: totalScore,
				timeSpent,
				completedAt: new Date(),
			},
		});

		// Aggiorna i progressi dell'utente
		await QuizService.updateUserProgress({
			userId,
			sectionId: quizAttempt.quiz.sectionId, // Usa l'ID della sezione dal quiz salvato
			quizMode: quizAttempt.quiz.quizMode,
			score: totalScore,
			timeSpent,
			totalQuestions: quizAttempt.quiz.questions.length,
		});

		return {
			id: quizAttemptId,
			score: totalScore,
			totalQuestions: quizAttempt.quiz.questions.length,
			correctAnswers,
			timeSpent,
			answers: savedAnswers,
		};
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
	 * Cancella un quiz in corso e tutti i record associati
	 */
	static async cancelQuiz(quizAttemptId: string, userId: string): Promise<void> {
		// Verifica che il quiz attempt esista e appartenga all'utente
		const quizAttempt = await prisma.quizAttempt.findFirst({
			where: {
				id: quizAttemptId,
				userId,
			},
			include: {
				quiz: {
					include: {
						questions: true,
					},
				},
				answers: true,
			},
		});

		if (!quizAttempt) {
			throw new Error("Quiz attempt non trovato");
		}

		// Verifica che il quiz non sia già stato completato
		if (quizAttempt.completedAt) {
			throw new Error("Quiz già completato");
		}

		// Cancella in cascata: prima gli answer attempts, poi il quiz attempt, poi il quiz
		// Gli answer attempts vengono cancellati automaticamente tramite la foreign key cascade
		// Le quiz questions vengono cancellate automaticamente tramite la foreign key cascade

		// Elimina il quiz attempt
		await prisma.quizAttempt.delete({
			where: { id: quizAttemptId },
		});

		// Elimina il quiz se non ha altri attempts associati
		const otherAttempts = await prisma.quizAttempt.findMany({
			where: {
				quizId: quizAttempt.quiz.id,
			},
		});

		if (otherAttempts.length === 0) {
			// Nessun altro attempt, possiamo eliminare il quiz
			// Le quiz questions vengono eliminate automaticamente per la cascata
			await prisma.quiz.delete({
				where: { id: quizAttempt.quiz.id },
			});
		}
	}

	/**
	 * Recupera i risultati di un quiz attempt specifico
	 */
	static async getQuizResults(attemptId: string, userId: string): Promise<any | null> {
		const quizAttempt = await prisma.quizAttempt.findFirst({
			where: {
				id: attemptId,
				userId: userId, // Assicuriamo che l'utente possa vedere solo i suoi risultati
			},
			include: {
				quiz: {
					include: {
						questions: {
							include: {
								question: true,
							},
							orderBy: {
								order: "asc",
							},
						},
						section: {
							include: {
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
						},
						evaluationMode: true,
					},
				},
				answers: {
					include: {
						question: true,
					},
				},
			},
		});

		if (!quizAttempt) {
			return null;
		}

		// Mappa le risposte nel formato atteso dal componente QuizResults
		const answers = quizAttempt.answers.map(answer => ({
			questionId: answer.questionId,
			userAnswer: answer.userAnswer,
			isCorrect: answer.score > 0,
			score: answer.score,
			question: {
				content: answer.question.content,
				correctAnswer: answer.question.correctAnswer,
			},
		}));

		// Mappa le domande del quiz con le opzioni complete
		const questions = quizAttempt.quiz.questions.map(qq => ({
			id: qq.question.id,
			content: qq.question.content,
			options: (qq.question.options as string[]) || [],
			correctAnswer: qq.question.correctAnswer as string[],
		}));

		return {
			id: quizAttempt.id,
			score: quizAttempt.score,
			totalQuestions: quizAttempt.quiz.questions.length,
			correctAnswers: quizAttempt.answers.filter(a => a.score > 0).length,
			timeSpent: quizAttempt.timeSpent || 0,
			quiz: {
				id: quizAttempt.quiz.id,
				title: quizAttempt.quiz.section.name, // Usa il nome della sezione come titolo
				description: `Quiz di ${quizAttempt.quiz.section.name}`,
				section: {
					name: quizAttempt.quiz.section.name,
					class: {
						name: quizAttempt.quiz.section.class.name,
						course: {
							name: quizAttempt.quiz.section.class.course.name,
						},
					},
				},
				questions,
				evaluationMode: {
					name: quizAttempt.quiz.evaluationMode.name,
					description: quizAttempt.quiz.evaluationMode.description || undefined,
					correctAnswerPoints: quizAttempt.quiz.evaluationMode.correctAnswerPoints,
					incorrectAnswerPoints: quizAttempt.quiz.evaluationMode.incorrectAnswerPoints,
					partialCreditEnabled: quizAttempt.quiz.evaluationMode.partialCreditEnabled,
				},
			},
			answers,
		};
	}

	/**
	 * Aggiorna i progressi dell'utente
	 */
	private static async updateUserProgress(params: {
		userId: string;
		sectionId: string;
		quizMode: QuizMode;
		score: number;
		timeSpent: number;
		totalQuestions: number;
	}): Promise<void> {
		const { userId, sectionId, quizMode, score, timeSpent, totalQuestions } = params;

		// Trova o crea il record di progresso
		const existingProgress = await prisma.progress.findUnique({
			where: {
				userId_sectionId: {
					userId,
					sectionId,
				},
			},
		});

		const percentage = (score / totalQuestions) * 100;

		if (existingProgress) {
			// Aggiorna il progresso esistente
			const updateData: any = {
				totalQuestionsStudied: existingProgress.totalQuestionsStudied + totalQuestions,
				lastAccessedAt: new Date(),
				updatedAt: new Date(),
			};

			if (quizMode === "STUDY") {
				const newStudyQuizCount = existingProgress.studyQuizzesTaken + 1;
				const currentAverage = existingProgress.studyAverageScore || 0;
				const newAverage =
					(currentAverage * existingProgress.studyQuizzesTaken + percentage) /
					newStudyQuizCount;

				updateData.studyQuizzesTaken = newStudyQuizCount;
				updateData.studyAverageScore = newAverage;
				updateData.studyBestScore = Math.max(
					existingProgress.studyBestScore || 0,
					percentage
				);
				updateData.studyTotalTimeSpent =
					existingProgress.studyTotalTimeSpent + timeSpent;
			} else if (quizMode === "EXAM_SIMULATION") {
				const newExamQuizCount = existingProgress.examQuizzesTaken + 1;
				const currentAverage = existingProgress.examAverageScore || 0;
				const newAverage =
					(currentAverage * existingProgress.examQuizzesTaken + percentage) /
					newExamQuizCount;

				updateData.examQuizzesTaken = newExamQuizCount;
				updateData.examAverageScore = newAverage;
				updateData.examBestScore = Math.max(
					existingProgress.examBestScore || 0,
					percentage
				);
				updateData.examTotalTimeSpent = existingProgress.examTotalTimeSpent + timeSpent;
			}

			await prisma.progress.update({
				where: {
					userId_sectionId: {
						userId,
						sectionId,
					},
				},
				data: updateData,
			});
		} else {
			// Crea un nuovo record di progresso
			const createData: any = {
				userId,
				sectionId,
				totalQuestionsStudied: totalQuestions,
				lastAccessedAt: new Date(),
				firstAccessedAt: new Date(),
			};

			if (quizMode === "STUDY") {
				createData.studyQuizzesTaken = 1;
				createData.studyAverageScore = percentage;
				createData.studyBestScore = percentage;
				createData.studyTotalTimeSpent = timeSpent;
			} else if (quizMode === "EXAM_SIMULATION") {
				createData.examQuizzesTaken = 1;
				createData.examAverageScore = percentage;
				createData.examBestScore = percentage;
				createData.examTotalTimeSpent = timeSpent;
			}

			await prisma.progress.create({
				data: createData,
			});
		}
	}
}
