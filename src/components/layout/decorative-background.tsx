/**
 * App-wide decorative background — soft top gradient plus two blurred orbs.
 * Mounted in the `_app` layout and on full-screen play routes (quiz, flashcard)
 * so the visual treatment stays consistent across the app.
 */
export function DecorativeBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
      <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="absolute -right-20 top-40 h-[300px] w-[300px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
    </div>
  )
}
