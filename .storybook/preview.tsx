import { withThemeByClassName } from "@storybook/addon-themes"
import type { Preview, ReactRenderer } from "@storybook/react-vite"

import "@fontsource/poppins/400.css"
import "@fontsource/poppins/500.css"
import "@fontsource/poppins/600.css"
import "@fontsource/poppins/700.css"
import "../src/styles/globals.css"
import "../src/styles/markdown.css"

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
    (Story) => (
      <div className="bg-background text-foreground w-full min-w-64 rounded-xl p-8">
        <Story />
      </div>
    ),
  ],
}

export default preview
