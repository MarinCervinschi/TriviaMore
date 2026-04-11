import { cn } from "@/lib/utils"

type FilterOption = { value: string; label: string }

export function FilterPills({
  options,
  value,
  onChange,
  label,
}: {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  label?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="text-xs font-medium text-muted-foreground mr-1">{label}</span>
      )}
      <button
        onClick={() => onChange("")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          !value
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        Tutti
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(value === opt.value ? "" : opt.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
