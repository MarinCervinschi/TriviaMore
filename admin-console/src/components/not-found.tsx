import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function NotFound() {
	return (
		<div className="flex flex-col items-center px-6 py-24 text-center">
			<p className="text-muted-foreground font-mono text-sm">404</p>
			<h1 className="mt-2 text-xl font-semibold">Pagina non trovata</h1>
			<p className="text-muted-foreground mt-1 text-sm">
				Questa pagina non esiste nella console.
			</p>
			<Button asChild variant="outline" className="mt-6">
				<Link to="/">Torna alla panoramica</Link>
			</Button>
		</div>
	);
}
