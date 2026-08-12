import type { UserProfile } from "./types";

export function getRoleLabel(role: string): string {
	switch (role) {
		case "SUPERADMIN":
			return "Super Amministratore";
		case "ADMIN":
			return "Amministratore";
		case "MAINTAINER":
			return "Manutentore";
		case "STUDENT":
			return "Studente";
		default:
			return role;
	}
}

export function getDisplayName(profile: UserProfile): string {
	if (profile.name) return profile.name;
	if (profile.email) return profile.email.split("@")[0];
	return "Utente Anonimo";
}

export function getInitials(profile: UserProfile): string {
	if (profile.name) {
		return profile.name
			.split(" ")
			.map(n => n[0])
			.join("")
			.toUpperCase();
	}
	return profile.email?.charAt(0).toUpperCase() ?? "U";
}

export function getDifficultyColor(difficulty: string): string {
	switch (difficulty) {
		case "EASY":
			return "bg-success/10 text-success";
		case "MEDIUM":
			return "bg-warning/10 text-warning";
		case "HARD":
			return "bg-danger/10 text-danger";
		default:
			return "bg-muted text-muted-foreground";
	}
}

export function getDifficultyLabel(difficulty: string): string {
	switch (difficulty) {
		case "EASY":
			return "Facile";
		case "MEDIUM":
			return "Medio";
		case "HARD":
			return "Difficile";
		default:
			return difficulty;
	}
}

export function getQuestionTypeLabel(type: string): string {
	switch (type) {
		case "MULTIPLE_CHOICE":
			return "Scelta multipla";
		case "TRUE_FALSE":
			return "Vero/Falso";
		case "SHORT_ANSWER":
			return "Risposta aperta";
		default:
			return type;
	}
}
