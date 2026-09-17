import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { InlineEmpty } from "@/components/ui/empty-state";
import { usePinAchievements } from "@/lib/achievements/mutations";
import type { AchievementView } from "@/lib/achievements/types";
import { cn } from "@/lib/utils";

import { AchievementMedal } from "./achievement-medal";

const LIMIT = 3;

/** Choosing the medals the dashboard shows. Order is the order they are picked in. */
export function PinPicker({
	open,
	onOpenChange,
	unlocked,
	pinned,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	unlocked: AchievementView[];
	pinned: AchievementView[];
}) {
	const [picked, setPicked] = useState<string[]>([]);
	const pin = usePinAchievements();

	// Reopening starts from what is saved, not from a half-finished edit.
	useEffect(() => {
		if (open) setPicked(pinned.map(entry => entry.key));
	}, [open, pinned]);

	const toggle = (key: string) =>
		setPicked(current =>
			current.includes(key)
				? current.filter(entry => entry !== key)
				: current.length >= LIMIT
					? current
					: [...current, key]
		);

	const save = () => pin.mutate(picked, { onSuccess: () => onOpenChange(false) });

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Scegli i traguardi in evidenza</DialogTitle>
					<DialogDescription>
						Fino a {LIMIT}, nell'ordine in cui li tocchi. Compaiono sulla tua dashboard.
					</DialogDescription>
				</DialogHeader>

				{unlocked.length === 0 ? (
					<InlineEmpty>
						Sblocca il primo traguardo e potrai metterlo in evidenza.
					</InlineEmpty>
				) : (
					<div className="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
						{unlocked.map(entry => {
							const index = picked.indexOf(entry.key);
							const isPicked = index !== -1;
							const full = picked.length >= LIMIT && !isPicked;

							return (
								<button
									key={entry.key}
									type="button"
									aria-pressed={isPicked}
									disabled={full}
									onClick={() => toggle(entry.key)}
									className={cn(
										"focus-visible:ring-ring relative flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
										isPicked ? "bg-muted" : "hover:bg-muted/50",
										full && "cursor-not-allowed opacity-40"
									)}
								>
									<AchievementMedal
										icon={entry.icon}
										accent={entry.accent}
										shape={entry.shape}
										tier={entry.tier}
										size="md"
									/>
									<span className="text-2xs leading-tight text-balance">
										{entry.name}
									</span>
									{isPicked && (
										<span className="bg-primary text-primary-foreground text-2xs absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full font-medium tabular-nums">
											{index + 1}
										</span>
									)}
								</button>
							);
						})}
					</div>
				)}

				<DialogFooter className="sm:justify-between">
					<Button
						type="button"
						variant="ghost"
						onClick={() => setPicked([])}
						disabled={picked.length === 0}
					>
						Togli tutti
					</Button>
					<Button type="button" onClick={save} disabled={pin.isPending}>
						{pin.isPending ? "Salvataggio…" : "Salva"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
