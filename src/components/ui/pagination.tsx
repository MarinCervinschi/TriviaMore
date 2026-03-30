import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  pageSize: number
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        {from}–{to} di {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              Math.abs(p - page) <= 1,
          )
          .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push("...")
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-1 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export type SortState<T> = {
  key: keyof T | null
  direction: "asc" | "desc"
}

export function usePaginatedSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  search: string,
  page: number,
  pageSize: number = 10,
  sort?: SortState<T>,
) {
  let filtered = search
    ? items.filter((item) => searchFn(item, search.toLowerCase()))
    : [...items]

  if (sort?.key) {
    const key = sort.key
    const dir = sort.direction === "asc" ? 1 : -1
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return dir
      if (bVal == null) return -dir
      if (typeof aVal === "string" && typeof bVal === "string")
        return aVal.localeCompare(bVal) * dir
      if (typeof aVal === "number" && typeof bVal === "number")
        return (aVal - bVal) * dir
      if (typeof aVal === "boolean" && typeof bVal === "boolean")
        return (Number(aVal) - Number(bVal)) * dir
      return String(aVal).localeCompare(String(bVal)) * dir
    })
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  return { paged, filtered, totalPages, safePage, totalItems: filtered.length }
}
