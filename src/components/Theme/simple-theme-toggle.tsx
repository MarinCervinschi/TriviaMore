"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function SimpleThemeToggle() {
	const { isDark, toggleTheme, mounted } = useTheme();

	if (!mounted) {
		return (
			<Button variant="ghost" size="sm" disabled>
				<Sun className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<Button variant="ghost" size="sm" onClick={toggleTheme}>
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
			<span className="sr-only">Cambia tema</span>
		</Button>
	);
}
