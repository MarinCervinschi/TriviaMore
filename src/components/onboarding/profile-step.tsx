import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** The avatar is a slot, so the chooser can change without touching this. */
export function ProfileStep({
	name,
	onNameChange,
	imageUrl,
	initials,
	avatarChooser,
}: {
	name: string;
	onNameChange: (name: string) => void;
	imageUrl?: string | null;
	initials: string;
	avatarChooser?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-4">
				<Avatar className="size-16">
					{imageUrl && <AvatarImage src={imageUrl} alt="" />}
					<AvatarFallback className="text-lg">{initials}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1 space-y-1.5">
					<Label htmlFor="onboarding-name">Come ti chiami</Label>
					<Input
						id="onboarding-name"
						value={name}
						onChange={event => onNameChange(event.target.value)}
						placeholder="Nome e cognome"
						autoComplete="name"
					/>
				</div>
			</div>
			{avatarChooser}
		</div>
	);
}
