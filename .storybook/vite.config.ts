import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const stubEmpty = fileURLToPath(new URL("./stub-empty.ts", import.meta.url));
const stubAsyncHooks = fileURLToPath(new URL("./stub-async-hooks.ts", import.meta.url));
const stubReactStart = fileURLToPath(new URL("./stub-react-start.ts", import.meta.url));

// Components reached through server functions transitively import TanStack
// Start's server entries (`#tanstack-router-entry`, `#tanstack-start-entry`, …).
// Those subpaths only resolve inside the Start Vite plugin, which we deliberately
// don't load — so resolve every `#tanstack-*` specifier to an empty module. The
// server code path never runs in a browser story.
function stubTanstackStartEntries() {
	return {
		name: "stub-tanstack-start-entries",
		enforce: "pre" as const,
		resolveId(id: string) {
			// The boundary a server function crosses. Stubbing it here is what lets a component that
			// reaches src/lib/*/api be storied at all — see the stub for why.
			if (id === "@tanstack/react-start" || id.startsWith("@tanstack/react-start/"))
				return stubReactStart;
			// src/lib/logging is server-only and keeps its request context in an AsyncLocalStorage.
			if (id === "node:async_hooks") return stubAsyncHooks;
			return id.startsWith("#tanstack-") || id.startsWith("tanstack-start-")
				? stubEmpty
				: null;
		},
	};
}

// Dedicated Vite config for Storybook, kept separate from the app's
// vite.config.ts on purpose: Storybook renders components in isolation and must
// not load the TanStack Start + Nitro server pipeline — the same reasoning as
// vitest.config.ts. Wired in via framework.options.builder.viteConfigPath, so
// the app config is never auto-detected.
export default defineConfig({
	plugins: [
		stubTanstackStartEntries(),
		tailwindcss(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
	],
});
