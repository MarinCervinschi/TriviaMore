import type { UserProfile } from "./types"

export function getRoleLabel(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "Super Amministratore"
    case "ADMIN":
      return "Amministratore"
    case "MAINTAINER":
      return "Manutentore"
    case "STUDENT":
      return "Studente"
    default:
      return role
  }
}

export function getDisplayName(profile: UserProfile): string {
  if (profile.name) return profile.name
  if (profile.email) return profile.email.split("@")[0]
  return "Utente Anonimo"
}

export function getInitials(profile: UserProfile): string {
  if (profile.name) {
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  return profile.email?.charAt(0).toUpperCase() ?? "U"
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "HARD":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "Facile"
    case "MEDIUM":
      return "Medio"
    case "HARD":
      return "Difficile"
    default:
      return difficulty
  }
}

export function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return "Scelta multipla"
    case "TRUE_FALSE":
      return "Vero/Falso"
    case "SHORT_ANSWER":
      return "Risposta aperta"
    default:
      return type
  }
}
