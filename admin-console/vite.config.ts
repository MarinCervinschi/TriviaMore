import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
	resolve: {
		// Plain aliases rather than tsconfig paths, which would stop at this package and miss the app's files.
		alias: { "~": path("./src"), "@": path("../src") },
		// The app's components must share one React and one router with the console.
		dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
	},
	plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
});
