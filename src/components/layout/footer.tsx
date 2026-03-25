export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TriviaMore. Tutti i diritti riservati.</p>
      </div>
    </footer>
  )
}
