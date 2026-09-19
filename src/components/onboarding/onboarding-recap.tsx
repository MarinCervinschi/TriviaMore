import { Pen2Icon } from "@solar-icons/react/linear/pen-2";

import type { Icon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface RecapEntry {
	label: string;
	icon: Icon;
	value: string | null;
	/** Jumps back to the step that sets it, when the rail is not enough. */
	onEdit?: () => void;
}

/** The only place the answers are visible at once, which is where a wrong
 *  department is actually noticed. */
export function OnboardingRecap({
	name,
	imageUrl,
	initials,
	entries,
}: {
	name: string;
	imageUrl?: string | null;
	initials: string;
	entries: RecapEntry[];
}) {
	return (
		<div className="bg-muted/40 flex flex-col gap-3 rounded-xl border p-3">
			<div className="flex items-center gap-3">
				<Avatar className="size-11">
					{imageUrl && <AvatarImage src={imageUrl} alt="" />}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<p className="min-w-0 flex-1 truncate font-medium">
					{name || <span className="text-muted-foreground">Senza nome</span>}
				</p>
			</div>
			<dl className="flex flex-col gap-2 text-sm">
				{entries.map(entry => (
					<div key={entry.label} className="flex items-center gap-3">
						<dt className="text-muted-foreground flex w-32 shrink-0 items-center gap-2">
							<entry.icon className="size-4 shrink-0" aria-hidden />
							{entry.label}
						</dt>
						<dd className="min-w-0 flex-1">
							{entry.value ?? (
								<span className="text-muted-foreground italic">Non scelto</span>
							)}
						</dd>
						{entry.onEdit && (
							<button
								type="button"
								onClick={entry.onEdit}
								aria-label={`Cambia ${entry.label.toLowerCase()}`}
								className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
							>
								<Pen2Icon className="size-4" />
							</button>
						)}
					</div>
				))}
			</dl>
		</div>
	);
}
