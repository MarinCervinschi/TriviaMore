import { useEffect, useState } from "react";

import { runThemeTransition } from "@/lib/theme-transition";
import { useThemeContext } from "@/providers/theme-provider";

type ToggleEvent = Pick<MouseEvent, "clientX" | "clientY"> | undefined;

export function useTheme() {
	const { theme, setTheme, resolvedTheme } = useThemeContext();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return {
			theme: undefined as string | undefined,
			setTheme,
			resolvedTheme: undefined as string | undefined,
			mounted: false,
			isDark: false,
			isLight: false,
			isSystem: false,
			toggleTheme: (_event?: ToggleEvent) => {},
			setLightTheme: () => {},
			setDarkTheme: () => {},
			setSystemTheme: () => {},
		};
	}

	const isDark = resolvedTheme === "dark";
	const isLight = resolvedTheme === "light";
	const isSystem = theme === "system";

	return {
		theme,
		setTheme,
		resolvedTheme,
		mounted: true,
		isDark,
		isLight,
		isSystem,
		toggleTheme: (event?: ToggleEvent) => {
			const next = isDark ? "light" : "dark";
			const origin =
				event && typeof event.clientX === "number"
					? { x: event.clientX, y: event.clientY }
					: null;
			runThemeTransition(() => setTheme(next), origin);
		},
		setLightTheme: () => setTheme("light"),
		setDarkTheme: () => setTheme("dark"),
		setSystemTheme: () => setTheme("system"),
	};
}
