import { useRouter } from "@tanstack/react-router";

import { logoutFn } from "./api";

export function useSignOut() {
	const router = useRouter();
	return async () => {
		await logoutFn();
		await router.invalidate();
		await router.navigate({ to: "/login" });
	};
}
