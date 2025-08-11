"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, Clock } from "lucide-react";

interface QuizTimerProps {
	timeLimit: number; // in minuti
	onTimeUp: () => void;
}

export function QuizTimer({ timeLimit, onTimeUp }: QuizTimerProps) {
	const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // converti in secondi
	const [isWarning, setIsWarning] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeRemaining(prev => {
				const newTime = prev - 1;

				// Warning quando rimangono 5 minuti
				if (newTime <= 300 && !isWarning) {
					setIsWarning(true);
				}

				// Tempo scaduto
				if (newTime <= 0) {
					clearInterval(timer);
					onTimeUp();
					return 0;
				}

				return newTime;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [onTimeUp, isWarning]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const getTimerColor = () => {
		if (timeRemaining <= 60) return "text-red-600 dark:text-red-400"; // Ultimo minuto
		if (timeRemaining <= 300) return "text-orange-600 dark:text-orange-400"; // Ultimi 5 minuti
		return "text-gray-700 dark:text-gray-300";
	};

	return (
		<div className={`flex items-center space-x-1 ${getTimerColor()}`}>
			{isWarning ? (
				<AlertTriangle className="h-4 w-4" />
			) : (
				<Clock className="h-4 w-4" />
			)}
			<span className="font-mono text-sm font-medium">{formatTime(timeRemaining)}</span>
		</div>
	);
}
