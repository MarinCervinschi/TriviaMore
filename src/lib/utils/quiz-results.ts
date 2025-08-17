// Utilità per la gestione e visualizzazione dei risultati dei quiz

export function getPerformanceLevel(score: number): {
	level: "excellent" | "good" | "fair" | "poor";
	label: string;
	color: string;
} {
	// Score in 33esimi: 30-33 eccellente, 25-29 buono, 20-24 sufficiente, <20 insufficiente
	if (score >= 30) {
		return { level: "excellent", label: "Eccellente", color: "green" };
	} else if (score >= 25) {
		return { level: "good", label: "Buono", color: "blue" };
	} else if (score >= 20) {
		return { level: "fair", label: "Sufficiente", color: "yellow" };
	} else {
		return { level: "poor", label: "Insufficiente", color: "red" };
	}
}

export function getScoreColor(score: number): string {
	if (score >= 30) return "text-green-600 dark:text-green-400";
	if (score >= 25) return "text-blue-600 dark:text-blue-400";
	if (score >= 20) return "text-yellow-600 dark:text-yellow-400";
	return "text-red-600 dark:text-red-400";
}

export function getScoreBadge(score: number): {
	label: string;
	color: string;
} {
	if (score >= 30)
		return {
			label: "Eccellente",
			color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
		};
	if (score >= 25)
		return {
			label: "Buono",
			color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
		};
	if (score >= 20)
		return {
			label: "Sufficiente",
			color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
		};
	return {
		label: "Insufficiente",
		color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
	};
}

export function formatTime(milliseconds: number): string {
	const seconds = Math.floor(milliseconds / 1000);
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimeSpent(milliseconds: number): string {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
	} else if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	} else {
		return `${seconds}s`;
	}
}

// Funzione per determinare il colore di un'opzione nelle domande
export function getOptionStyle(
	option: string,
	userAnswers: string[],
	correctAnswers: string[]
): string {
	const isUserAnswer = userAnswers.includes(option);
	const isCorrect = correctAnswers.includes(option);

	if (isCorrect && isUserAnswer) {
		// Risposta corretta data dall'utente
		return "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300";
	} else if (isCorrect && !isUserAnswer) {
		// Risposta corretta non data dall'utente
		return "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300";
	} else if (!isCorrect && isUserAnswer) {
		// Risposta sbagliata data dall'utente
		return "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300";
	} else {
		// Risposta non data e non corretta
		return "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300";
	}
}
