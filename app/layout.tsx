'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Loader from "@/components/Loader"

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
        <title>Trivia More</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {loading ? <Loader /> : children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
