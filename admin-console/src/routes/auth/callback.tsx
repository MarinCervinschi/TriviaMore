import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { completeOAuthFn } from "~/lib/auth/api";

export const Route = createFileRoute("/auth/callback")({
	validateSearch: z.object({ code: z.string().optional().catch(undefined) }),
	beforeLoad: async ({ search }) => {
		if (!search.code) throw redirect({ to: "/login" });
		const failure = await completeOAuthFn({ data: { code: search.code } });
		if (failure) throw redirect({ to: "/login", search: { error: failure } });
		throw redirect({ to: "/" });
	},
	component: () => null,
});
