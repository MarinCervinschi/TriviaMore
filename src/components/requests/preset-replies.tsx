type PresetRepliesProps = {
  presets: string[]
  onPick: (text: string) => void
}

// Quick-insert chips that append a canned reply to a note textarea.
export function PresetReplies({ presets, onPick }: PresetRepliesProps) {
  if (presets.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {presets.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onPick(preset)}
          className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {preset}
        </button>
      ))}
    </div>
  )
}
