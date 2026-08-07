import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// Dedicated Vite config for Storybook, kept separate from the app's
// vite.config.ts on purpose: Storybook renders components in isolation and must
// not load the TanStack Start + Nitro server pipeline — the same reasoning as
// vitest.config.ts. Wired in via framework.options.builder.viteConfigPath, so
// the app config is never auto-detected. Only what the isolated components need:
// Tailwind v4 and the `@/` + `#/` path aliases.
export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths({ projects: ["./tsconfig.json"] })],
})
