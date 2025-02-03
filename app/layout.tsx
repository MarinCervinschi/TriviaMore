'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Loader from './components/Loader'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Quiz App</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {loading ? <Loader /> : children}
      </body>
    </html>
  )
}
