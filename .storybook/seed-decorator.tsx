import type { Decorator } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";

import type { UserRole } from "@/db/schema/enums";

// The server-function stub throws rather than reaching a backend, so a component that fetches gets its
// data from here instead: seed the exact query key it reads.
//
//   parameters: { session: { role: "SUPERADMIN" } }
//   parameters: { queryData: [[["quiz", "evaluation-modes"], EVAL_MODES]] }

export type StorySession = { name?: string; email?: string; role?: UserRole } | null;

function seededSession(session: StorySession) {
	if (!session) return null;
	return {
		user: {
			id: "story-user",
			email: session.email ?? "marin@example.com",
			name: session.name ?? "Marin Cervinschi",
			image: null,
			role: session.role ?? "STUDENT",
		},
		supabaseSession: null,
	};
}

function Seed({
	session,
	queryData,
}: {
	session: StorySession;
	queryData: [unknown[], unknown][];
}) {
	const queryClient = useQueryClient();
	// `useAuth` reads this key, so seeding it is what signs a story in.
	queryClient.setQueryData(["auth", "session"], seededSession(session));
	for (const [key, data] of queryData) queryClient.setQueryData(key, data);
	return null;
}

export const withSeededQueries: Decorator = (Story, context) => {
	const session = (context.parameters.session ?? null) as StorySession;
	const queryData = (context.parameters.queryData ?? []) as [unknown[], unknown][];
	return (
		<>
			<Seed session={session} queryData={queryData} />
			<Story />
		</>
	);
};
