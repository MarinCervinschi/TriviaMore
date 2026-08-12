import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts on purpose: running tests through the
// TanStack Start + Nitro plugin pipeline invites failures unrelated to the code
// under test. Two tiers, one runner, split by file suffix:
//   *.test.ts   unit      no database, no network — `pnpm test`   (offline, CI-safe)
//   *.itest.ts  integration  DB-backed          — `pnpm test:db`
export default defineConfig({
	plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					environment: "node",
					include: ["src/**/*.test.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "integration",
					environment: "node",
					include: ["src/**/*.itest.ts"],
				},
			},
		],
	},
});
