import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Signing up and signing back in arrive on the same callback, and only the
 *  first one is signed in by the request that created the account. */
const NEW_ACCOUNT_WINDOW_MS = 10_000;

const exchangeCodeFn = createServerFn({ method: "GET" })
	.inputValidator((data: { code: string }) => data)
	.handler(async ({ data }) => {
		const supabase = createServerSupabaseClient();
		const { data: exchanged } = await supabase.auth.exchangeCodeForSession(data.code);

		const user = exchanged.user;
		if (!user?.last_sign_in_at) return { isNewAccount: false };

		return {
			isNewAccount:
				Date.parse(user.last_sign_in_at) - Date.parse(user.created_at) <
				NEW_ACCOUNT_WINDOW_MS,
		};
	});

export const Route = createFileRoute("/auth/callback")({
	validateSearch: (search: Record<string, unknown>) => ({
		code: (search.code as string) ?? "",
	}),
	beforeLoad: async ({ search }) => {
		if (search.code) {
			const { isNewAccount } = await exchangeCodeFn({ data: { code: search.code } });
			if (isNewAccount) throw redirect({ to: "/onboarding" });
		}
		throw redirect({ to: "/" });
	},
	component: () => null,
});
