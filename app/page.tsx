import DefaultLayout from "./components/Layouts/DefaultLayout"

export default function Home() {
  return (
    <DefaultLayout>
      <h1 className="text-3xl font-bold text-center">Welcome to the Quiz App</h1>
      <p className="text-center">Select a quiz section to start</p>
    </DefaultLayout>
  )
}
