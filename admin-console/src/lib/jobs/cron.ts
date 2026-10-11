export const SCHEDULE_TIMEZONE = "Europe/Rome";

export const WEEKDAYS = [
	"domenica",
	"lunedì",
	"martedì",
	"mercoledì",
	"giovedì",
	"venerdì",
	"sabato",
] as const;

/** How the form builds a schedule; anything the presets cannot say is a custom cron expression. */
export type Frequency =
	| { kind: "daily"; time: string }
	| { kind: "weekly"; weekday: number; time: string }
	| { kind: "monthly"; day: number; time: string }
	| { kind: "custom"; cron: string };

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

function minuteHour(time: string): [string, string] {
	const match = TIME.exec(time);
	if (!match) return ["0", "0"];
	return [String(Number(match[2])), String(Number(match[1]))];
}

export function toCron(frequency: Frequency): string {
	if (frequency.kind === "custom") return frequency.cron.trim();
	const [minute, hour] = minuteHour(frequency.time);
	if (frequency.kind === "daily") return `${minute} ${hour} * * *`;
	if (frequency.kind === "weekly") return `${minute} ${hour} * * ${frequency.weekday}`;
	return `${minute} ${hour} ${frequency.day} * *`;
}

const NUMBER = /^\d{1,2}$/;

export function fromCron(cron: string): Frequency {
	const parts = cron.trim().split(/\s+/);
	if (parts.length !== 5) return { kind: "custom", cron };
	const [minute, hour, day, month, weekday] = parts as [
		string,
		string,
		string,
		string,
		string,
	];
	if (!NUMBER.test(minute) || !NUMBER.test(hour) || month !== "*")
		return { kind: "custom", cron };
	const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
	if (!TIME.test(time)) return { kind: "custom", cron };
	if (day === "*" && weekday === "*") return { kind: "daily", time };
	if (day === "*" && /^[0-6]$/.test(weekday))
		return { kind: "weekly", weekday: Number(weekday), time };
	if (weekday === "*" && NUMBER.test(day) && Number(day) >= 1 && Number(day) <= 28) {
		return { kind: "monthly", day: Number(day), time };
	}
	return { kind: "custom", cron };
}

/** `Ogni lunedì alle 06:00`; a custom expression is shown as it is. */
export function describeCron(cron: string): string {
	const frequency = fromCron(cron);
	if (frequency.kind === "daily") return `Ogni giorno alle ${frequency.time}`;
	if (frequency.kind === "weekly")
		return `Ogni ${WEEKDAYS[frequency.weekday]} alle ${frequency.time}`;
	if (frequency.kind === "monthly")
		return `Il ${frequency.day} di ogni mese alle ${frequency.time}`;
	const [minute, hour, day, month, weekday] = cron.trim().split(/\s+/);
	if (day === "*" && month === "*" && weekday === "*") {
		const everyHours = /^\*\/(\d+)$/.exec(hour ?? "");
		if (everyHours && minute && NUMBER.test(minute)) {
			return minute === "0"
				? `Ogni ${everyHours[1]} ore`
				: `Ogni ${everyHours[1]} ore, al minuto ${minute}`;
		}
		const everyMinutes = /^\*\/(\d+)$/.exec(minute ?? "");
		if (everyMinutes && hour === "*") return `Ogni ${everyMinutes[1]} minuti`;
		if (minute === "*" && hour === "*") return "Ogni minuto";
	}
	return `Cron ${cron.trim()}`;
}
