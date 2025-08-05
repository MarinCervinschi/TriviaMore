import './globals.css'
import { Poppins } from 'next/font/google'

export const metadata = {
  title: 'Trivia MORE',
  description: 'A quiz app for exam preparation',
  url: 'https://trivia-more.vercel.app',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  )
}
