import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookies } from "@tanstack/react-start/server";

/** The name `SidebarProvider` already writes on every toggle. */
const SIDEBAR_COOKIE = "sidebar_state";

/**
 * Whether the rail starts open. It has to be a cookie rather than `localStorage`:
 * the sidebar is server-rendered, and only a cookie reaches the server. Storage is
 * readable no earlier than hydration, which would either flash the wrong width or —
 * if the state were read into React — render a tree the server did not send.
 *
 * `SidebarProvider` was already writing this cookie and nothing was reading it back,
 * which is why the rail reopened itself on every load.
 */
export const readSidebarOpen = createIsomorphicFn()
	.server(() => getCookies()[SIDEBAR_COOKIE] !== "false")
	.client(() => !document.cookie.includes(`${SIDEBAR_COOKIE}=false`));
