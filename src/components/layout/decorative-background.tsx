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
			<div className="from-primary/5 dark:from-primary/10 absolute inset-0 bg-gradient-to-b via-transparent to-transparent" />
			<div className="bg-primary/8 absolute top-0 -left-32 h-[400px] w-[400px] rounded-full blur-[100px]" />
			<div className="absolute top-40 -right-20 h-[300px] w-[300px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
		</div>
	);
}
