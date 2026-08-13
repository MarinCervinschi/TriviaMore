import type { Decorator } from "@storybook/react-vite";
import { useGlobals } from "storybook/preview-api";

import { ThemeContext } from "@/providers/theme-provider";

// The app's ThemeProvider applies `.dark` to <html>, which is exactly what the theme toolbar owns:
// mounting the real one makes the two fight on load. So the context comes from the toolbar instead —
// `useTheme` works, and a ThemeToggle inside a story drives the toolbar rather than diverging from it.
export const withTheme: Decorator = (Story, context) => {
	const [, updateGlobals] = useGlobals();
	const resolvedTheme = context.globals.theme === "dark" ? "dark" : "light";

	return (
		<ThemeContext.Provider
			value={{
				theme: resolvedTheme,
				resolvedTheme,
				setTheme: theme =>
					updateGlobals({ theme: theme === "system" ? "light" : theme }),
			}}
		>
			<Story />
		</ThemeContext.Provider>
	);
};
