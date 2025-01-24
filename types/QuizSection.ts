import QuizQuestion from '@/types/QuizQuestion';

export default interface QuizSection {
    id: string;
    name: string;
    questions: QuizQuestion[];
    icon?: React.ReactNode;
}