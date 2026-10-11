import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False on the server and through hydration, true from the first render after. */
export function useIsHydrated(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false
	);
}
