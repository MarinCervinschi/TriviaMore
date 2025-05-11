"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Bold, Italic, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleLatexToolbarProps {
  targetRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement>
  onFormatText: (format: string) => void
}

export function SimpleLatexToolbar({ targetRef, onFormatText }: SimpleLatexToolbarProps) {
  const [selection, setSelection] = useState({ text: "", start: 0, end: 0 })
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [visible, setVisible] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const handleSelectionChange = () => {
      const selectedText = target.value.substring(target.selectionStart ?? 0, target.selectionEnd ?? 0)

      if (selectedText && selectedText.trim().length > 0) {
        // Get position of selection
        const selectionRect = getSelectionCoordinates(target)

        setSelection({
          text: selectedText,
          start: target.selectionStart ?? 0,
          end: target.selectionEnd ?? 0,
        })

        setPosition({
          top: selectionRect.top - 40, // Position above the selection
          left: selectionRect.left,
        })

        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node) && e.target !== target) {
        setVisible(false)
      }
    }

    // Listen for selection changes
    target.addEventListener("mouseup", handleSelectionChange)
    target.addEventListener("keyup", handleSelectionChange)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      target.removeEventListener("mouseup", handleSelectionChange)
      target.removeEventListener("keyup", handleSelectionChange)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [targetRef])

  // Improved selection coordinates function
  const getSelectionCoordinates = (input: HTMLTextAreaElement | HTMLInputElement) => {
    // Get input position
    const inputRect = input.getBoundingClientRect()

    // Default position at the top of the input
    return {
      top: inputRect.top - 40, // Position above the input
      left: inputRect.left + 10,
    }
  }

  if (!visible) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-background border rounded-md shadow-md flex items-center p-1"
      style={{
        top: `${Math.max(10, position.top)}px`, // Ensure it's not off the top of the screen
        left: `${Math.min(position.left, window.innerWidth - 120)}px`, // Ensure it's not off the right of the screen
      }}
    >
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onFormatText("bold")}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onFormatText("italic")}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onFormatText("underline")}>
        <Underline className="h-4 w-4" />
      </Button>
    </div>
  )
}
