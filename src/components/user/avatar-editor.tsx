import { useState } from "react";

import { CameraIcon } from "@solar-icons/react/linear/camera";
import { useQuery } from "@tanstack/react-query";

import { AvatarChooser } from "@/components/onboarding/avatar-chooser";
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
import { avatarQueries } from "@/lib/avatar/queries";
import { cn } from "@/lib/utils";

/** The picture doubles as the way to change it, so the dashboard and settings
 *  do not each need their own form. */
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
	const [page, setPage] = useState(0);
	const [seed, setSeed] = useState<string | null>(null);

	const choices = useQuery({ ...avatarQueries.choices(page), enabled: open });
	const setGenerated = useSetGeneratedAvatar();
	const upload = useUploadAvatar();

	const preview = choices.data?.find(choice => choice.seed === seed)?.dataUri;

	async function save() {
		if (seed) await setGenerated.mutateAsync(seed);
		setOpen(false);
		setSeed(null);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next);
				if (!next) setSeed(null);
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
						<AvatarImage src={preview ?? imageUrl ?? undefined} alt="" />
						<AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
					</Avatar>
					<p className="text-muted-foreground text-sm">
						La foto viene ridotta a 512px prima di essere caricata.
					</p>
				</div>

				<AvatarChooser
					choices={choices.data ?? []}
					selectedSeed={seed}
					onSelect={setSeed}
					onShuffle={() => setPage(current => current + 1)}
					onUpload={file =>
						upload.mutate(file, {
							onSuccess: () => {
								setSeed(null);
								setOpen(false);
							},
						})
					}
					isLoading={choices.isFetching}
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
