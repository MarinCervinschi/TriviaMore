"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function SimpleThemeToggle() {
	const { isDark, toggleTheme, mounted } = useTheme();

	if (!mounted) {
		return (
			<Button variant="outline" size="icon" disabled>
				<Sun className="h-[1.2rem] w-[1.2rem]" />
			</Button>
		);
	}

	return (
		<Button variant="outline" size="icon" onClick={toggleTheme}>
			{isDark ? (
				<Sun className="h-[1.2rem] w-[1.2rem]" />
			) : (
				<Moon className="h-[1.2rem] w-[1.2rem]" />
			)}
			<span className="sr-only">Cambia tema</span>
		</Button>
	);
}
