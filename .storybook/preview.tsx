import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-serif-display/400.css";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview, ReactRenderer } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../src/styles/globals.css";
import "../src/styles/markdown.css";
import { withRouter } from "./router-decorator";
import { SeededQueries } from "./seed-decorator";

// Provided globally so any component using TanStack Query renders. Retries off, because the
// server-function stub throws rather than reaching a backend: a story feeds data through props or by
// seeding this cache (see auth-decorator).
const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

const preview: Preview = {
	parameters: {
		controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
		// 'todo' surfaces a11y violations without failing — the safety net for the
		// upcoming design-system restyle.
		a11y: { test: "todo" },
		layout: "centered",
	},
	decorators: [
		// Toggles exactly the `.dark` class the app's ThemeProvider uses, so every
		// story is inspectable in both themes from the toolbar.
		withThemeByClassName<ReactRenderer>({
			themes: { light: "", dark: "dark" },
			defaultTheme: "light",
		}),
		// The provider and the seeding are one decorator on purpose: seeding calls useQueryClient, so
		// splitting them makes the story depend on Storybook's decorator ordering.
		(Story, context) => (
			<QueryClientProvider client={queryClient}>
				<SeededQueries context={context}>
					<Story />
				</SeededQueries>
			</QueryClientProvider>
		),
		withRouter,
		Story => (
			<div className="bg-background text-foreground w-full min-w-64 rounded-xl p-8">
				<Story />
			</div>
		),
	],
};

export default preview;
