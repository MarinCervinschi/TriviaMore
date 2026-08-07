import { createServerFn } from "@tanstack/react-start";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { oauthProviderSchema } from "../schemas";

export const oauthSignInFn = createServerFn({ method: "POST" })
	.inputValidator(oauthProviderSchema)
	.handler(async ({ data }) => {
		const { data: authData, error } =
			await createServerSupabaseClient().auth.signInWithOAuth({
				provider: data.provider,
				options: {
					redirectTo: `${process.env.VITE_APP_URL ?? "http://localhost:3000"}/auth/callback`,
				},
			});
		if (error) return { success: false as const, error: error.message };
		return { success: true as const, url: authData.url };
	});
