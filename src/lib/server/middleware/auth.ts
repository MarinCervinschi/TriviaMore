import { createMiddleware } from "@tanstack/react-start";

import { readActiveSession, requireAdmin, requireSuperadmin } from "@/lib/auth/guards";

import { Unauthorized } from "../errors";

type SessionUser = {
	id: string;
	email: string | null;
};

async function readSessionUser(): Promise<SessionUser | null> {
	const active = await readActiveSession();
	if (!active) return null;
	const { user } = active.session;
	return { id: user.id, email: user.email };
}

export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const user = await readSessionUser();
		if (!user) throw new Unauthorized();
		return next({ context: { user } });
	}
);

export const optionalAuthMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => next({ context: { user: await readSessionUser() } }));

// These redirect instead of throwing, matching the guards they wrap.
export const adminMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => next({ context: { user: await requireAdmin() } })
);

export const superadminMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => next({ context: { user: await requireSuperadmin() } }));
