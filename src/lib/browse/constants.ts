export const COURSE_TYPE_CONFIG: Record<string, { label: string; className: string }> =
	{
		BACHELOR: {
			label: "Triennale",
			className: "bg-chart-2/10 text-chart-2-ink border-chart-2/20",
		},
		MASTER: {
			label: "Magistrale",
			className: "bg-chart-4/10 text-chart-4-ink border-chart-4/20",
		},
		SINGLE_CYCLE: {
			label: "Ciclo Unico",
			className: "bg-chart-3/10 text-chart-3-ink border-chart-3/20",
		},
	};

export const CAMPUS_LOCATION_CONFIG: Record<string, { label: string; short: string }> =
	{
		MODENA: { label: "Modena", short: "MO" },
		REGGIO_EMILIA: { label: "Reggio Emilia", short: "RE" },
		CARPI: { label: "Carpi", short: "CP" },
		MANTOVA: { label: "Mantova", short: "MN" },
	};

// All five slots at once, so chart-2 and chart-4 sit together and collapse under CVD.
// The icon each area renders is what keeps colour from being the only channel.
export const AREA_CONFIG: Record<
	string,
	{ label: string; gradient: string; accent: string }
> = {
	SCIENZE: {
		label: "Scienze",
		gradient: "from-chart-2/15 to-chart-2/5",
		accent: "bg-chart-2",
	},
	TECNOLOGIA: {
		label: "Tecnologia",
		gradient: "from-chart-4/15 to-chart-4/5",
		accent: "bg-chart-4",
	},
	SALUTE: {
		label: "Salute",
		gradient: "from-chart-1/15 to-chart-1/5",
		accent: "bg-chart-1",
	},
	VITA: {
		label: "Vita",
		gradient: "from-chart-3/15 to-chart-3/5",
		accent: "bg-chart-3",
	},
	SOCIETA_CULTURA: {
		label: "Società e cultura",
		gradient: "from-chart-5/15 to-chart-5/5",
		accent: "bg-chart-5",
	},
};

export const AREA_LABELS: Record<string, string> = Object.fromEntries(
	Object.entries(AREA_CONFIG).map(([k, v]) => [k, v.label])
);
