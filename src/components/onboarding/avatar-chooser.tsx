import { useRef } from "react";

import { GallerySendIcon } from "@solar-icons/react/linear/gallery-send";
import { RefreshIcon } from "@solar-icons/react/linear/refresh";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { AvatarChoice } from "@/lib/avatar/types";
import { cn } from "@/lib/utils";

/** Previews go through `<img>`: the SVG is ours, but an image element cannot
 *  run one either way, and that is the property worth keeping. */
export function AvatarChooser({
	choices,
	selectedSeed,
	onSelect,
	onShuffle,
	onUpload,
	isLoading = false,
	isUploading = false,
}: {
	choices: AvatarChoice[];
	selectedSeed?: string | null;
	onSelect: (seed: string) => void;
	onShuffle: () => void;
	onUpload: (file: File) => void;
	isLoading?: boolean;
	isUploading?: boolean;
}) {
	const fileInput = useRef<HTMLInputElement>(null);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-2">
				<p className="text-muted-foreground text-sm">Scegli un avatar</p>
				<div className="flex items-center gap-1">
					<Button variant="ghost" size="sm" onClick={onShuffle} disabled={isLoading}>
						{isLoading ? (
							<Spinner className="size-4" />
						) : (
							<RefreshIcon className="size-4" />
						)}
						Altri
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => fileInput.current?.click()}
						disabled={isUploading}
					>
						{isUploading ? (
							<Spinner className="size-4" />
						) : (
							<GallerySendIcon className="size-4" />
						)}
						Carica una foto
					</Button>
				</div>
			</div>

			<input
				ref={fileInput}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				onChange={event => {
					const file = event.target.files?.[0];
					if (file) onUpload(file);
					event.target.value = "";
				}}
			/>

			<ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
				{choices.map(choice => {
					const selected = choice.seed === selectedSeed;
					return (
						<li key={choice.seed}>
							<button
								type="button"
								aria-pressed={selected}
								onClick={() => onSelect(choice.seed)}
								className={cn(
									"focus-visible:ring-ring bg-muted aspect-square w-full cursor-pointer overflow-hidden rounded-xl transition-shadow focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
									selected ? "ring-primary ring-2" : "hover:ring-border hover:ring-2"
								)}
							>
								<img src={choice.dataUri} alt="" className="size-full" />
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
