import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/confirm")({
	validateSearch: (search: Record<string, unknown>) => ({
		error: typeof search.error === "string" ? search.error : "",
		from: search.from === "login" ? ("login" as const) : ("signup" as const),
	}),
	beforeLoad: ({ search }) => {
		if (search.error) throw redirect({ to: "/auth/auth-code-error" });
		throw redirect({ to: search.from === "login" ? "/user" : "/onboarding" });
	},
	component: () => null,
});
