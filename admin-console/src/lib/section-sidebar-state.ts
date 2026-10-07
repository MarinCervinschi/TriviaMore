import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookies } from "@tanstack/react-start/server";

export const SECTION_SIDEBAR_COOKIE = "console_section_sidebar";

// A cookie because the shell is server-rendered, and only a cookie reaches the server.
export const readSectionSidebarOpen = createIsomorphicFn()
	.server(() => getCookies()[SECTION_SIDEBAR_COOKIE] !== "false")
	.client(() => !document.cookie.includes(`${SECTION_SIDEBAR_COOKIE}=false`));

export function writeSectionSidebarOpen(open: boolean) {
	document.cookie = `${SECTION_SIDEBAR_COOKIE}=${open}; path=/; max-age=31536000; samesite=lax`;
}
