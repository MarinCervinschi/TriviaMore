import { readFile } from "node:fs/promises";

// Cutting the chain at @tanstack/react-start was not enough. Without the Start plugin's transform a
// server function's handler body stays in the graph, and those bodies reach the services, Drizzle and
// finally `pg` — which the production build tree-shook away but the dev server happily pre-bundles,
// where it dies on `Buffer is not defined`.
//
// So the cut belongs at the app's own boundary instead: every module under src/lib/*/api/ is replaced
// by one that exports the same names and nothing else. Nothing downstream of it is ever loaded.
// A story feeds data by seeding the query cache; calling one of these throws on purpose.

const API_PATH = /[/\\]src[/\\]lib[/\\][^/\\]+[/\\]api[/\\]/;

const NAMED_REEXPORT = /export\s*\{([^}]*)\}/g;
const DECLARED =
	/export\s+(?:declare\s+)?(?:const|let|var|function|async function|class)\s+([A-Za-z_$][\w$]*)/g;

function exportedNames(source: string): string[] {
	const names = new Set<string>();
	for (const match of source.matchAll(NAMED_REEXPORT)) {
		for (const part of match[1].split(",")) {
			const name = part
				.split(/\s+as\s+/)
				.pop()
				?.trim()
				.replace(/^type\s+/, "");
			if (name && /^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
		}
	}
	for (const match of source.matchAll(DECLARED)) names.add(match[1]);
	names.delete("default");
	return [...names];
}

export function stubServerApi() {
	return {
		name: "stub-server-api",
		enforce: "pre" as const,
		async load(id: string) {
			const path = id.split("?")[0];
			if (!API_PATH.test(path) || !/\.tsx?$/.test(path)) return null;
			const source = await readFile(path, "utf8");
			const names = exportedNames(source);
			const thrower = (name: string) =>
				`export const ${name} = () => {\n\tthrow new Error(\n\t\t"${name} is a server function and was called inside a story. Seed the query cache instead."\n\t);\n};`;
			return [
				"// Replaced by .storybook/stub-server-api.ts — see it for why.",
				...names.map(thrower),
			].join("\n");
		},
	};
}
