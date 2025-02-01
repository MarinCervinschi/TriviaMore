import QuizSection from './QuizSection'

export default interface QuizClass {
    id: string
    name: string
    get sections(): QuizSection[]
    icon?: React.ReactNode
}

