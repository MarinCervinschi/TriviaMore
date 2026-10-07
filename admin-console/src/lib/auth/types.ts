export type ConsoleSession = { userId: string; email: string | null };

export type LoginResult = { success: true } | { success: false; error: string };
