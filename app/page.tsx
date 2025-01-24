'use client'

import { Quiz } from '@components/quiz/Quiz'
import { webTecnologies } from '@/lib/web-tecnologies/web-tecnologies'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="flex items-center">
        <button className="text-3xl" onClick={() => window.location.reload()}> 💻 </button>
        <h1 className="text-2xl laptop:text-3xl font-bold my-5">&nbsp; Tecnologie Web Quiz</h1>
      </div>
      <Quiz sections={webTecnologies} />
    </div>
  )
}
