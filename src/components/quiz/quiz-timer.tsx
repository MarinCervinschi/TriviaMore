import { useEffect, useRef, useState } from "react";

import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";

export function QuizTimer({
	timeLimitMinutes,
	resumeFromSeconds = 0,
	onTick,
	onTimeUp,
}: {
	/** Minutes; null counts up with no limit. */
	timeLimitMinutes: number | null;
	/** Seconds spent in earlier sittings. */
	resumeFromSeconds?: number;
	onTick?: (elapsedSeconds: number) => void;
	onTimeUp: () => void;
}) {
	const isUnlimited = timeLimitMinutes === null;
	const [elapsed, setElapsed] = useState(resumeFromSeconds);
	const anchorRef = useRef(Date.now() - resumeFromSeconds * 1000);
	const onTickRef = useRef(onTick);
	const onTimeUpRef = useRef(onTimeUp);

	useEffect(() => {
		onTickRef.current = onTick;
		onTimeUpRef.current = onTimeUp;
	});

	useEffect(() => {
		anchorRef.current = Date.now() - resumeFromSeconds * 1000;
		setElapsed(resumeFromSeconds);
	}, [resumeFromSeconds]);

	// Read off the wall clock, because a hidden tab is throttled and a tick count drifts.
	useEffect(() => {
		const interval = setInterval(() => {
			const next = Math.floor((Date.now() - anchorRef.current) / 1000);
			setElapsed(next);
			onTickRef.current?.(next);

			if (!isUnlimited && next >= timeLimitMinutes * 60) {
				clearInterval(interval);
				onTimeUpRef.current();
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [isUnlimited, timeLimitMinutes]);

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
