import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { verifyEmailSchema } from "../schemas";

export const verifyEmailFn = createServerFn({ method: "POST" })
	.inputValidator(verifyEmailSchema)
	.handler(async ({ data }) => {
		const { error } = await createServerSupabaseClient().auth.verifyOtp({
			type: data.type as EmailOtpType,
			token_hash: data.token_hash,
		});
		if (error) return { success: false as const, error: error.message };
		return { success: true as const };
	});
