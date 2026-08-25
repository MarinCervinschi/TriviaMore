import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and through hydration, true from the first render after.
 *
 * The escape hatch for anything whose value depends on where it runs — the
 * viewer's timezone (see `lib/utils/datetime.ts`), their locale, `window`. Such
 * a value cannot be server-rendered: the two answers differ and React reports a
 * hydration mismatch it will not patch. Render a neutral placeholder while this
 * is false, then the real thing.
 */
export function useIsHydrated(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false
	);
}
