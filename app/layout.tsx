import './globals.css'
import { Poppins } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from '@/components/ui/sonner'
import ReactQueryProvider from '@/lib/react-query-provider'

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
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
