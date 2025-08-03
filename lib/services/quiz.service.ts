import { prisma } from '../prisma';
import {
    GuestQuizRequest,
    StartQuizRequest,
    CompleteQuizRequest,
    Quiz,
    QuizResult,
    GuestQuizResponse,
    QuizAttemptResponse
} from '../types/quiz.types';
import { QuizMode } from '@prisma/client';

export class QuizService {

    /**
     * Genera un quiz per utenti anonimi basato sulla sezione specificata
     */
    async generateGuestQuiz(params: GuestQuizRequest): Promise<GuestQuizResponse> {
        const {
            sectionId,
            questionCount = 30,
            quizMode = QuizMode.STUDY
        } = params;

        const allQuestions = await prisma.section.findFirst({
            where: {
                id: sectionId,
                isPublic: true
            },
            include: {
                questions: true
            }
        });

        if (!allQuestions || allQuestions.questions.length === 0) {
            throw new Error('Sezione non trovata o nessuna domanda disponibile');
        }

        const selectedQuestions = this.selectRandomItems(allQuestions.questions, questionCount);

        const defaultEvaluationMode = await prisma.evaluationMode.findFirst({
            where: { name: 'Standard' }
        });

        if (!defaultEvaluationMode) {
            throw new Error('Modalità di valutazione non configurata');
        }

        const quiz: Quiz = {
            id: `guest-${Date.now()}`,
            sectionId: allQuestions.id,
            evaluationModeId: defaultEvaluationMode.id,
            quizMode,
            questions: selectedQuestions.map((q: any, index: number) => ({
                id: q.id,
                content: q.content,
                questionType: q.questionType,
                options: q.options as string[] | undefined,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || undefined,
                difficulty: q.difficulty,
                order: index + 1
            }))
        };

        return {
            quiz,
            tempId: quiz.id
        };
    }

    /**
     * Avvia un quiz per un utente registrato
     */
    async startQuiz({ }): Promise<void> {
        // TODO: Implementare la logica per avviare un quiz
    }

    /**
     * Completa un quiz e salva i progressi
     */
    async completeQuiz({ }): Promise<void> {
        // TODO: Implementare la logica per completare il quiz
    }


    /**
     * Mescola casualmente un array usando l'algoritmo Fisher-Yates
     */
    private shuffleArray<T>(array: T[]): T[] {
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
    private selectRandomItems<T>(array: T[], count: number): T[] {
        if (count >= array.length) {
            return this.shuffleArray(array);
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
    private async updateUserProgress({ }): Promise<void> {
        // TODO: Implementare la logica per aggiornare i progressi dell'utente
    }
}
