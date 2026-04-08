export const COURSE_TYPE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  BACHELOR: {
    label: "Triennale",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  MASTER: {
    label: "Magistrale",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  SINGLE_CYCLE: {
    label: "Ciclo Unico",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
}

export const CAMPUS_LOCATION_CONFIG: Record<
  string,
  { label: string; short: string }
> = {
  MODENA: { label: "Modena", short: "MO" },
  REGGIO_EMILIA: { label: "Reggio Emilia", short: "RE" },
  CARPI: { label: "Carpi", short: "CP" },
  MANTOVA: { label: "Mantova", short: "MN" },
}

export const AREA_LABELS: Record<string, string> = {
  SCIENZE: "Scienze",
  TECNOLOGIA: "Tecnologia",
  SALUTE: "Salute",
  VITA: "Vita",
  SOCIETA_CULTURA: "Societa e Cultura",
}
