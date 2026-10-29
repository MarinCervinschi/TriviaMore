import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { setGeneratedAvatarFn, uploadAvatarFn } from "./api";
import { resizeForAvatar } from "./resize";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"] as const;
/** The picked file, before downscaling. */
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

/** The browser downscales the picture and sends the bytes; the server checks and stores them. */
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

			const form = new FormData();
			form.append("file", await resizeForAvatar(file), "avatar.webp");

			return uploadAvatarFn({ data: form });
		},
		onSuccess: () => {
			invalidateProfile(queryClient);
			toast.success("Foto aggiornata");
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
