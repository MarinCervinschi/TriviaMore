import Link from "next/link";

import { BookOpen } from "lucide-react";

export function MinimalFooter() {
	return (
		<footer className="border-t bg-background py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<Link href="/" className="flex items-center gap-2">
							<BookOpen className="h-5 w-5 text-blue-600" />
							<span className="text-lg font-bold text-foreground">TriviaMore</span>
						</Link>
					</div>

					{/* Links */}
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<Link href="/privacy" className="transition-colors hover:text-foreground">
							Privacy Policy
						</Link>
						<Link href="/terms" className="transition-colors hover:text-foreground">
							Terms of Service
						</Link>
						<Link href="/contact" className="transition-colors hover:text-foreground">
							Contact
						</Link>
					</div>

					{/* Copyright */}
					<div className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} TriviaMore. All rights reserved.
					</div>
				</div>
			</div>
		</footer>
	);
}
