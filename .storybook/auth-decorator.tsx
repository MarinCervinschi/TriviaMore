import type { Decorator } from "@storybook/react-vite";
import { useQueryClient } from "@tanstack/react-query";

import type { UserRole } from "@/db/schema/enums";

// `useAuth` reads ["auth", "session"], so seeding that key is how a story gets a signed-in user
// without a network call — the server-function stub throws on purpose. Declare it per story:
//
//   parameters: { session: { role: "SUPERADMIN" } }   // signed in, that role
//   parameters: { session: null }                     // signed out (the default)

export type StorySession = { name?: string; email?: string; role?: UserRole } | null;

function Seed({ session }: { session: StorySession }) {
	const queryClient = useQueryClient();
	queryClient.setQueryData(
		["auth", "session"],
		session
			? {
					user: {
						id: "story-user",
						email: session.email ?? "marin@example.com",
						name: session.name ?? "Marin Cervinschi",
						image: null,
						role: session.role ?? "STUDENT",
					},
					supabaseSession: null,
				}
			: null
	);
	return null;
}

export const withSession: Decorator = (Story, context) => {
	const session = (context.parameters.session ?? null) as StorySession;
	return (
		<>
			<Seed session={session} />
			<Story />
		</>
	);
};
