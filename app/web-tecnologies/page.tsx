import { Quiz } from '@components/quiz/Quiz'
import DefaultLayout from '../components/Layouts/DefaultLayout'
import webTecnologies from '@/lib/web-tecnologies/web-tecnologies'

export default function WebTecnologies() {
    return (
        <DefaultLayout>
            <div className="container mx-auto my-8">
                <h1 className="text-2xl lg:text-3xl font-bold my-5 text-center">💻 Tecnologie Web Quiz</h1>
                <Quiz sections={webTecnologies} />
            </div>
        </DefaultLayout>
    )
}