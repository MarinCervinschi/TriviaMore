import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="flex items-center">
        <h1 className="text-2xl laptop:text-3xl font-bold my-5">Quiz App</h1>
      </div>
        <Link href="/web-tecnologies">Web</Link>
    </div>
  )
}
