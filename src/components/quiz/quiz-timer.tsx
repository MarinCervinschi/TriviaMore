import { useEffect, useRef, useState } from "react";

import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";

export function QuizTimer({
	timeLimitMinutes,
	resumeFromSeconds = 0,
	onTick,
	onTimeUp,
}: {
	/** Countdown limit in minutes; null = open-ended chronometer counting up. */
	timeLimitMinutes: number | null;
	/** Seconds already spent in earlier sittings, restored from the draft. */
	resumeFromSeconds?: number;
	onTick?: (elapsedSeconds: number) => void;
	onTimeUp: () => void;
}) {
	const isUnlimited = timeLimitMinutes === null;
	const [elapsed, setElapsed] = useState(resumeFromSeconds);
	const secondsRef = useRef(resumeFromSeconds);
	const onTickRef = useRef(onTick);

	useEffect(() => {
		onTickRef.current = onTick;
	}, [onTick]);

	useEffect(() => {
		secondsRef.current = resumeFromSeconds;
		setElapsed(resumeFromSeconds);
	}, [resumeFromSeconds]);

	// The count lives in a ref so a tick can report it without the report being a
	// side effect of rendering: only a real second ever reaches `onTick`, which is
	// what stops a mount from handing the page a zero that overwrites the draft.
	useEffect(() => {
		const interval = setInterval(() => {
			const next = secondsRef.current + 1;
			secondsRef.current = next;
			setElapsed(next);
			onTickRef.current?.(next);

			if (!isUnlimited && next >= timeLimitMinutes * 60) {
				clearInterval(interval);
				onTimeUp();
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [onTimeUp, isUnlimited, timeLimitMinutes]);

	const totalSeconds = isUnlimited
		? elapsed
		: Math.max(0, timeLimitMinutes * 60 - elapsed);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;
	const isWarning = !isUnlimited && totalSeconds < 300;

	const display =
		hours > 0
			? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
			: `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

	return (
		<div
			className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium tabular-nums transition-colors ${
				isWarning
					? "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400"
					: "bg-muted text-muted-foreground"
			}`}
			aria-label={isUnlimited ? "Tempo trascorso" : "Tempo rimanente"}
		>
			<ClockCircleIcon className="h-3.5 w-3.5" />
			{display}
		</div>
	);
}
