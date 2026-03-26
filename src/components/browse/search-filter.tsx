import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function SearchFilter({
  value,
  onChange,
  placeholder = "Cerca...",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative mb-6">
      <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 pl-10"
      />
    </div>
  )
}
