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

export const AREA_CONFIG: Record<
  string,
  { label: string; gradient: string; accent: string }
> = {
  SCIENZE: {
    label: "Scienze",
    gradient: "from-blue-500/15 to-cyan-500/5",
    accent: "bg-blue-500",
  },
  TECNOLOGIA: {
    label: "Tecnologia",
    gradient: "from-indigo-500/15 to-violet-500/5",
    accent: "bg-indigo-500",
  },
  SALUTE: {
    label: "Salute",
    gradient: "from-rose-500/15 to-pink-500/5",
    accent: "bg-rose-500",
  },
  VITA: {
    label: "Vita",
    gradient: "from-emerald-500/15 to-teal-500/5",
    accent: "bg-emerald-500",
  },
  SOCIETA_CULTURA: {
    label: "Societa e Cultura",
    gradient: "from-amber-500/15 to-orange-500/5",
    accent: "bg-amber-500",
  },
}

export const AREA_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(AREA_CONFIG).map(([k, v]) => [k, v.label]),
)
