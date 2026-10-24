import { createMiddleware } from "@tanstack/react-start";

import { requireAdmin, requireSuperadmin } from "@/lib/auth/guards";
import { readSession } from "@/lib/auth/server";
import { attachUser } from "@/lib/logging/context";
import { timeAuthCheck } from "@/lib/logging/server";

import { Unauthorized } from "../errors";

type SessionUser = {
	id: string;
	email: string | null;
};

async function readSessionUser(): Promise<SessionUser | null> {
	const session = await timeAuthCheck(readSession);
	if (!session) return null;
	// Only the id, so no email reaches Seq.
	attachUser(session.user.id);
	return { id: session.user.id, email: session.user.email };
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
