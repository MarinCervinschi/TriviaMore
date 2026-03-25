import type { ReactNode } from "react"

export function ItemGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}
