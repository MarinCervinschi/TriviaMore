import bcrypt from "bcryptjs";

// Cost 10 is what GoTrue used, so a migrated hash and a new one cost the same to check.
const BCRYPT_COST = 10;

export function hashPassword(password: string) {
	return bcrypt.hash(password, BCRYPT_COST);
}

/** Also verifies the `$2a$` hashes GoTrue wrote. */
export function verifyPassword({ hash, password }: { hash: string; password: string }) {
	return bcrypt.compare(password, hash);
}

/** Whether `email` may hold an account: any address when no domain is set. */
export function isAllowedEmail(
	email: string | null | undefined,
	allowedDomain?: string
) {
	if (!allowedDomain) return true;
	return !!email && email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);
}
