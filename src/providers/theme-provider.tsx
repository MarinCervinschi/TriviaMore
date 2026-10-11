import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
	theme: Theme;
	resolvedTheme: "light" | "dark";
	setTheme: (theme: Theme) => void;
}

/** Exported so a Storybook decorator can supply the context without writing `.dark` on <html>. */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
}

function applyTheme(resolved: "light" | "dark", disableTransition = true) {
	const root = document.documentElement;

	if (disableTransition) {
		root.style.setProperty("transition", "none");
	}

	root.classList.toggle("dark", resolved === "dark");

	if (disableTransition) {
		// Forces a reflow before transitions are re-enabled.
		void root.offsetHeight;
		root.style.removeProperty("transition");
	}
}

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return defaultTheme;
		return getStoredTheme();
	});

	const resolvedTheme = useMemo(
		() => (theme === "system" ? getSystemTheme() : theme),
		[theme]
	);

	const setTheme = useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem(STORAGE_KEY, newTheme);
	}, []);

	useEffect(() => {
		applyTheme(resolvedTheme);
	}, [resolvedTheme]);

	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme(getSystemTheme());

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [theme]);

	const value = useMemo(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme, setTheme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useThemeContext must be used within a ThemeProvider");
	}
	return context;
}
