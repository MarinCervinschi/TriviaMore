import { lazy } from "react";

import { SOURCE_DOCUMENTS } from "~/lib/sources/documents";
import { SCALAR_IT } from "~/lib/sources/scalar-it";

let scalar: Promise<typeof import("@scalar/api-reference-react")> | undefined;

/** Starts fetching Scalar and its stylesheet; the route calls it on preload, so the download begins on hover. */
export function loadScalar() {
	scalar ??= Promise.all([
		import("@scalar/api-reference-react"),
		import("@scalar/api-reference-react/style.css"),
	]).then(([module]) => module);
	return scalar;
}

// Scalar reaches `window` as it loads, so it is fetched only in the browser.
const ApiReference = lazy(() =>
	loadScalar().then(module => ({ default: module.ApiReferenceReact }))
);

const THEME_CSS = `
.light-mode, .dark-mode {
	--scalar-font: var(--font-sans);
	--scalar-font-code: var(--font-mono);
	--scalar-background-1: hsl(var(--card));
	--scalar-background-2: hsl(var(--muted) / 0.5);
	--scalar-background-3: hsl(var(--muted));
	--scalar-background-accent: hsl(var(--brand) / 0.1);
	--scalar-color-1: hsl(var(--foreground));
	--scalar-color-2: hsl(var(--muted-foreground));
	--scalar-color-3: hsl(var(--muted-foreground) / 0.8);
	--scalar-color-accent: hsl(var(--brand));
	--scalar-border-color: hsl(var(--border));
	--scalar-color-green: hsl(var(--success));
	--scalar-color-red: hsl(var(--danger));
	--scalar-color-orange: hsl(var(--warning));
	--scalar-color-blue: hsl(var(--info));
	--scalar-sidebar-background-1: hsl(var(--card));
	--scalar-sidebar-item-active-background: hsl(var(--muted));
	--scalar-sidebar-color-active: hsl(var(--foreground));
	--scalar-sidebar-search-background: hsl(var(--muted) / 0.5);
	--scalar-sidebar-search-border-color: hsl(var(--border));
	--scalar-scrollbar-color: hsl(var(--muted-foreground) / 0.3);
	--scalar-scrollbar-color-active: hsl(var(--muted-foreground) / 0.6);
	--scalar-button-1: hsl(var(--primary));
	--scalar-button-1-color: hsl(var(--primary-foreground));
	--scalar-button-1-hover: hsl(var(--primary) / 0.9);
	--scalar-radius: 0.5rem;
	--scalar-radius-lg: 0.75rem;
	--scalar-radius-xl: 1rem;
}
.scalar-app code,
.scalar-app pre,
.scalar-app .endpoint-path {
	font-variant-ligatures: none;
}
.scalar-app .tag-name {
	text-transform: none;
}
.scalar-app .collapsible-section-content:has(> .schema-card),
.scalar-app .section-accordion-content-card > .properties {
	margin: 0.25rem 0 0.5rem 0.75rem;
	padding-left: 1rem;
	border-left: 1px solid var(--scalar-border-color);
}
`;

/** Scalar's reference and request client over every source; render it inside Suspense, in the browser only. */
export function SourcesExplorer({ dark }: { dark: boolean }) {
	return (
		<ApiReference
			configuration={{
				sources: SOURCE_DOCUMENTS,
				proxyUrl: "/api/proxy",
				theme: "default",
				layout: "modern",
				customCss: THEME_CSS,
				withDefaultFonts: false,
				forceDarkModeState: dark ? "dark" : "light",
				hideDarkModeToggle: true,
				telemetry: false,
				showDeveloperTools: "never",
				mcp: { disabled: true },
				agent: { disabled: true },
				documentDownloadType: "json",
				hiddenClients: true,
				expandAllResponses: true,
				expandAllSchemaProperties: true,
				orderSchemaPropertiesBy: "preserve",
				localization: { locale: "it", translations: SCALAR_IT },
			}}
		/>
	);
}
