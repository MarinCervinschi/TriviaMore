export default interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswers: number[];
    section: string;
}