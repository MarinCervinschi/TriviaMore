export type ConsoleSession = { userId: string; email: string | null };

/** The session as the shell shows it, with the name and photo of the owner's TriviaMore profile. */
export type ConsoleAccount = ConsoleSession & {
	name: string | null;
	image: string | null;
};

export type LoginResult = { success: true } | { success: false; error: string };

export type GoogleSignInResult =
	| { success: true; url: string }
	| { success: false; error: string };

/** Why a Google sign-in came back to /login; the page owns the wording, so a link cannot inject a message. */
export type OAuthFailure = "not-owner" | "failed";
