import QuizQuestion from './QuizQuestion';

export default interface QuizSection {
    id: string;
    name: string;
    get questions(): QuizQuestion[];
    icon?: React.ReactNode;
}