type Origin = { x: number; y: number } | null

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function runThemeTransition(update: () => void, origin: Origin): void {
  if (
    typeof document === "undefined" ||
    typeof document.startViewTransition !== "function" ||
    prefersReducedMotion()
  ) {
    update()
    return
  }

  const root = document.documentElement
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  root.style.setProperty("--theme-cx", `${x}px`)
  root.style.setProperty("--theme-cy", `${y}px`)

  document.startViewTransition(update)
}
