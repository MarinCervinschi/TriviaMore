// Stand-in for TanStack Start's server-only `#tanstack-router-entry`, which is
// pulled in transitively through server functions but never executed inside a
// Storybook story (the browser only runs the client half). Aliased to this in
// .storybook/vite.config.ts so the client bundle can resolve it.
export {}
