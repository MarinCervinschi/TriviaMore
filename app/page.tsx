import DefaultLayout from "./components/Layouts/DefaultLayout"
import Link from 'next/link'

export default function Home() {
  return (
    <DefaultLayout>
      <div className="flex flex-col justify-center p-4 space-y-4">
        <h1 className="text-3xl font-bold text-center">Welcome to the Quiz App</h1>
        <p className="text-center">Select a quiz section to start</p>
        <Link href="/web-tecnologies" className="text-2xl font-bold text-center">Web Technologies</Link>
      </div>
    </DefaultLayout>
  )
}
