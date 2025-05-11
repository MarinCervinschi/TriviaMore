"use client"

import type React from "react"

import { useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { SimpleLatexToolbar } from "@/components/LateX/simple-latex-toolbar"
import SmartInlineMath from "@/components/SmartInlineMath"

interface LatexTextFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
  label?: string
  preview?: boolean
}

export function LatexTextField({
  value,
  onChange,
  placeholder = "Enter text or LaTeX formula ($...$)",
  multiline = false,
  className = "",
  label,
  preview = false,
}: LatexTextFieldProps) {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFormatText = (format: string) => {
    if (!inputRef.current) return

    const input = inputRef.current
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const selectedText = value.substring(start, end)

    if (!selectedText) return

    let formattedText = ""
    switch (format) {
      case "bold":
        formattedText = `$\\textbf{${selectedText}}$`
        break
      case "italic":
        formattedText = `$\\textit{${selectedText}}$`
        break
      case "underline":
        formattedText = `$\\underline{${selectedText}}$`
        break
      case "arrow":
        formattedText = `$\\rightarrow{${selectedText}}$`
        break
      default:
        formattedText = selectedText
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Set focus back to input after formatting
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        // Position cursor after the formatted text
        const newPosition = start + formattedText.length
        inputRef.current.setSelectionRange(newPosition, newPosition)
      }
    }, 0)
  }

  return (
    <div className="relative space-y-2 flex-1" ref={containerRef}>
      {multiline ? (
        <>
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
            rows={4}
          />
        </>
      ) : (
        <>
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
          />
        </>
      )}

      <SimpleLatexToolbar targetRef={inputRef} onFormatText={handleFormatText} />

      {preview && (
        <div className="p-2 border rounded-md bg-muted/10 min-h-[24px]">
          <SmartInlineMath text={value} />
        </div>
      )}
    </div>
  )
}
