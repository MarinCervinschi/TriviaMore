"use client"

import type React from "react"
import "katex/dist/katex.min.css"
import { InlineMath } from "react-katex"

interface SmartInlineMathProps {
  text: string
}

const SmartInlineMath: React.FC<SmartInlineMathProps> = ({ text }) => {
  if (!text) return null

  // Check if the text contains LaTeX delimiters
  const hasInlineMath = text.includes("$")

  if (!hasInlineMath) {
    return <span>{text}</span>
  }

  // Split the text by '$' to identify LaTeX portions
  const parts = text.split("$")

  const renderParts = () => {
    const elements: React.ReactNode[] = []
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (i % 2 === 0) {
        // Even indices are regular text
        elements.push(<span key={`text-${i}`}>{part}</span>)
      } else {
        // Odd indices are LaTeX expressions
        try {
          elements.push(
            <InlineMath
              key={`math-${i}`}
              math={part}
              renderError={(error) => <span className="text-red-500">Error rendering LaTeX: {error.message}</span>}
            />,
          )
        } catch (error: any) {
          elements.push(
            <span key={`error-${i}`} className="text-red-500">
              Error rendering LaTeX: {error.message}
            </span>,
          )
        }
      }
    }
    return elements
  }

  return <>{renderParts()}</>
}

export default SmartInlineMath
