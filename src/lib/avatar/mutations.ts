import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	confirmUploadedAvatarFn,
	createAvatarUploadUrlFn,
	setGeneratedAvatarFn,
} from "./api";
import { resizeForAvatar } from "./resize";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"] as const;
/** The picked file, before downscaling — the stored one is a fraction of this. */
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

function invalidateProfile(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
	queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
}

export function useSetGeneratedAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (seed: string) => setGeneratedAvatarFn({ data: { seed } }),
		onSuccess: () => {
			invalidateProfile(queryClient);
			toast.success("Avatar aggiornato");
		},
		onError: (error: Error) => toast.error(error.message),
	});
}

/** Three moves, because the bucket has no write policy: the server names and
 *  signs, the browser sends the bytes, the server commits the result. */
export function useUploadAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (file: File) => {
			if (!ACCEPTED.some(type => type === file.type)) {
				throw new Error("Formato non supportato. Usa JPG, PNG o WebP.");
			}
			if (file.size > MAX_SOURCE_BYTES) {
				throw new Error("L'immagine supera i 20 MB.");
			}

			const resized = await resizeForAvatar(file);
			const contentType = "image/webp" as const;

			const { path, token } = await createAvatarUploadUrlFn({ data: { contentType } });

			const { createClient } = await import("@/lib/supabase/client");
			const { error } = await createClient()
				.storage.from("avatars")
				.uploadToSignedUrl(path, token, resized, { contentType });

			if (error) throw new Error("Caricamento non riuscito. Riprova.");

			return confirmUploadedAvatarFn({ data: { path } });
		},
		onSuccess: () => {
			invalidateProfile(queryClient);
			toast.success("Foto aggiornata");
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
