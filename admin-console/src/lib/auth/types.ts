/** `userId` is the owner's TriviaMore profile, null when none has their email; both are null locally. */
export type ConsoleSession = { userId: string | null; email: string | null };

/** The session as the shell shows it, with the name and photo of the owner's TriviaMore profile. */
export type ConsoleAccount = ConsoleSession & {
	name: string | null;
	image: string | null;
};
