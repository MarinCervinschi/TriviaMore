import { useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { SortState } from "./admin-pagination"

type SortableHeaderProps<T> = {
  label: string
  sortKey: keyof T
  sort: SortState<T>
  onSort: (key: keyof T) => void
  className?: string
}

export function SortableHeader<T>({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: SortableHeaderProps<T>) {
  const isActive = sort.key === sortKey

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 font-medium", className)}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive ? (
        sort.direction === "asc" ? (
          <ArrowUp className="ml-1 h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="ml-1 h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />
      )}
    </Button>
  )
}

export function useSort<T>() {
  const [sort, setSort] = useState<SortState<T>>({
    key: null,
    direction: "asc",
  })

  function toggleSort(key: keyof T) {
    setSort((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  return { sort, toggleSort }
}

