import { type ReactNode, useState } from "react";

import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { RestartIcon } from "@solar-icons/react/linear/restart";
import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { IconTile } from "@/components/ui/icon-tile";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useCancelOpenAttempt } from "@/lib/quiz/mutations";
import type { OpenAttempt } from "@/lib/quiz/types";
import { formatDateTime } from "@/lib/utils/format";

function useAttemptActions(attempt: OpenAttempt) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const cancel = useCancelOpenAttempt();

	const label = attempt.quizMode === "EXAM_SIMULATION" ? "simulazione d'esame" : "quiz";

	const resume = (
		<Button asChild>
			<Link to="/quiz/$quizId" params={{ quizId: attempt.quizId }}>
				<RestartIcon />
				Riprendi
			</Link>
		</Button>
	);

	const discard = (
		<Button
			variant="ghost"
			onClick={() => setConfirmOpen(true)}
			disabled={cancel.isPending}
			className="text-danger hover:text-danger hover:bg-destructive/10"
		>
			<TrashBinMinimalisticIcon />
			Elimina
		</Button>
	);

	const confirmation = (
		<ConfirmationDialog
			open={confirmOpen}
			onOpenChange={setConfirmOpen}
			title={`Eliminare il ${label} in corso?`}
			description="Il quiz e le risposte che hai dato andranno persi. Non è reversibile."
			confirmText="Elimina"
			variant="destructive"
			onConfirm={() => cancel.mutate(attempt.attemptId)}
		/>
	);

	return { label, resume, discard, confirmation };
}

function AttemptWhere({ attempt }: { attempt: OpenAttempt }): ReactNode {
	// The instant is formatted in the reader's zone, which the server container does
	// not share: rendering it before hydration mismatches by the whole offset.
	const isHydrated = useIsHydrated();

	return (
		<>
			{attempt.sectionName} · {attempt.className}
			{isHydrated ? ` — iniziato il ${formatDateTime(attempt.startedAt)}` : ""}
		</>
	);
}

export function OpenAttemptBanner({
	attempt,
	className,
}: {
	attempt: OpenAttempt;
	className?: string;
}) {
	const { label, resume, discard, confirmation } = useAttemptActions(attempt);

	return (
		<>
			<Card className={className}>
				<div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<IconTile variant="soft">
							<ClockCircleIcon />
						</IconTile>
						<div className="space-y-1">
							<p className="font-medium">Hai un {label} in corso</p>
							<p className="text-muted-foreground text-sm">
								<AttemptWhere attempt={attempt} />
							</p>
						</div>
					</div>
					<div className="flex shrink-0 gap-2">
						{resume}
						{discard}
					</div>
				</div>
			</Card>
			{confirmation}
		</>
	);
}

export function OpenAttemptDialog({
	attempt,
	open,
	onOpenChange,
}: {
	attempt: OpenAttempt;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { label, resume, discard, confirmation } = useAttemptActions(attempt);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle>Hai già un {label} in corso</DialogTitle>
						<DialogDescription>
							Puoi averne uno solo alla volta. Riprendilo o eliminalo per iniziarne un
							altro.
						</DialogDescription>
					</DialogHeader>
					<p className="text-sm font-medium">
						<AttemptWhere attempt={attempt} />
					</p>
					<DialogFooter className="gap-2">
						{discard}
						{resume}
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{confirmation}
		</>
	);
}
