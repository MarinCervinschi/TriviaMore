import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookies } from "@tanstack/react-start/server";

/** The cookie `SidebarProvider` writes on every toggle. */
const SIDEBAR_COOKIE = "sidebar_state";

// A cookie because the sidebar is server-rendered, and only a cookie reaches the server.
export const readSidebarOpen = createIsomorphicFn()
	.server(() => getCookies()[SIDEBAR_COOKIE] !== "false")
	.client(() => !document.cookie.includes(`${SIDEBAR_COOKIE}=false`));
