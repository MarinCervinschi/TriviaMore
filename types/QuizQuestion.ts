export default interface QuizQuestion {
    id?: string;
    classId: string;
    sectionId: string;
    question: string;
    options: string[];
    answer: number[];
}