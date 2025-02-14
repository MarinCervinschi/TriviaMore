export default interface QuizQuestion {
    _id?: string
    classId: string;
    sectionId: string;
    question: string;
    options: string[];
    answer: number[];
    __v?: number;
}