import './globals.css'
import { Poppins } from 'next/font/google'
import { ThemeProvider } from "@/providers/theme-provider"

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
    <html lang="it" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
