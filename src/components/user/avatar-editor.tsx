import { useState } from "react";

import { CameraIcon } from "@solar-icons/react/linear/camera";

import { AvatarChooser } from "@/components/onboarding/avatar-chooser";
import { useAvatarChoice } from "@/components/onboarding/use-avatar-choice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useSetGeneratedAvatar, useUploadAvatar } from "@/lib/avatar/mutations";
import { cn } from "@/lib/utils";

export function AvatarEditor({
	imageUrl,
	initials,
	name,
	className,
	fallbackClassName,
}: {
	imageUrl?: string | null;
	initials: string;
	name: string;
	className?: string;
	fallbackClassName?: string;
}) {
	const [open, setOpen] = useState(false);
	const avatar = useAvatarChoice({ enabled: open });
	const setGenerated = useSetGeneratedAvatar();
	const upload = useUploadAvatar();

	const seed = avatar.chosen?.seed;

	async function save() {
		try {
			if (seed) await setGenerated.mutateAsync(seed);
		} catch {
			// The mutation shows its own toast, and the dialog stays open to retry.
			return;
		}
		setOpen(false);
		avatar.clear();
	}

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next);
				if (!next) avatar.clear();
			}}
		>
			<DialogTrigger asChild>
				<button
					type="button"
					aria-label="Cambia immagine del profilo"
					className={cn(
						"group focus-visible:ring-ring relative cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none",
						className
					)}
				>
					<Avatar className="size-full">
						<AvatarImage src={imageUrl ?? undefined} alt={name} />
						<AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
					</Avatar>
					<span
						aria-hidden
						className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
					>
						<CameraIcon className="size-1/3 text-white" />
					</span>
				</button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Immagine del profilo</DialogTitle>
					<DialogDescription>
						Scegli un avatar generato oppure carica una tua foto.
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-4">
					<Avatar className="size-16">
						<AvatarImage src={avatar.chosen?.dataUri ?? imageUrl ?? undefined} alt="" />
						<AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
					</Avatar>
					<p className="text-muted-foreground text-sm">
						La foto viene ridotta a 512px prima di essere caricata.
					</p>
				</div>

				<AvatarChooser
					{...avatar.chooserProps}
					onUpload={file =>
						upload.mutate(file, {
							onSuccess: () => {
								avatar.clear();
								setOpen(false);
							},
						})
					}
					isUploading={upload.isPending}
				/>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Annulla
					</Button>
					<Button
						onClick={() => void save()}
						disabled={!seed || setGenerated.isPending}
					>
						Salva
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
