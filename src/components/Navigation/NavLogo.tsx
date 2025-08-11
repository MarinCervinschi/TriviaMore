import Link from "next/link";

import { BookOpen } from "lucide-react";

export function NavLogo() {
	return (
		<div className="flex items-center gap-2">
			<Link href="/" className="flex items-center gap-2">
				<BookOpen className="h-8 w-8 text-blue-600" />
				<h1 className="text-2xl font-bold text-foreground">TriviaMore</h1>
			</Link>
		</div>
	);
}
