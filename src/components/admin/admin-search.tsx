import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

type AdminSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function AdminSearch({
  value,
  onChange,
  placeholder = "Cerca...",
}: AdminSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
