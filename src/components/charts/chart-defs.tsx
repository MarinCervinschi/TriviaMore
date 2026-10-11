export type ChartFill = "solid" | "gradient" | "hatched";

export type DefSeries = {
	key: string;
	color?: string;
	fill?: ChartFill;
};

/** The SVG `<defs>` every chart shares, with ids namespaced by the chart's `useId`. */
export function ChartDefs({
	scope,
	series,
	brandFirst = false,
}: {
	scope: string;
	series: DefSeries[];
	brandFirst?: boolean;
}) {
	return (
		<defs>
			<pattern
				id={`${scope}-hatch`}
				width="6"
				height="6"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(-45)"
			>
				<rect width="6" height="6" fill="white" fillOpacity={0.32} />
				<rect width="2" height="6" fill="white" fillOpacity={1} />
			</pattern>
			<mask id={`${scope}-hatch-mask`}>
				<rect width="100%" height="100%" fill={`url(#${scope}-hatch)`} />
			</mask>

			{series.map((item, index) => {
				const color = item.color ?? `var(--color-${item.key})`;
				const isBrand = brandFirst && index === 0 && !item.color;

				return (
					<g key={item.key}>
						<linearGradient
							id={`${scope}-gradient-stops-${item.key}`}
							x1="0"
							y1="0"
							x2={isBrand ? "1" : "0"}
							y2="1"
						>
							{isBrand ? (
								<>
									<stop offset="0%" stopColor="var(--color-gradient-from)" />
									<stop offset="100%" stopColor="var(--color-gradient-to)" />
								</>
							) : (
								<>
									<stop offset="0%" stopColor={color} stopOpacity={0.95} />
									<stop offset="100%" stopColor={color} stopOpacity={0.45} />
								</>
							)}
						</linearGradient>
						<pattern
							id={`${scope}-gradient-${item.key}`}
							patternUnits="userSpaceOnUse"
							width="100%"
							height="100%"
						>
							<rect
								width="100%"
								height="100%"
								fill={`url(#${scope}-gradient-stops-${item.key})`}
							/>
						</pattern>
						<pattern
							id={`${scope}-hatched-${item.key}`}
							patternUnits="userSpaceOnUse"
							width="100%"
							height="100%"
						>
							<rect
								width="100%"
								height="100%"
								fill={color}
								mask={`url(#${scope}-hatch-mask)`}
							/>
						</pattern>
					</g>
				);
			})}
		</defs>
	);
}

/** The fill for a mark; a per-datum colour always gets a flat fill. */
export function seriesFill(
	scope: string,
	series: DefSeries,
	perDatumColour = false
): string {
	const variant: ChartFill = perDatumColour ? "solid" : (series.fill ?? "gradient");
	return variant === "solid"
		? (series.color ?? `var(--color-${series.key})`)
		: `url(#${scope}-${variant}-${series.key})`;
}

export function AreaFadeDefs({
	scope,
	series,
}: {
	scope: string;
	series: DefSeries[];
}) {
	return (
		<defs>
			{series.map(item => {
				const color = item.color ?? `var(--color-${item.key})`;
				return (
					<linearGradient
						key={item.key}
						id={`${scope}-fade-${item.key}`}
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						<stop offset="0%" stopColor={color} stopOpacity={0.3} />
						<stop offset="100%" stopColor={color} stopOpacity={0.02} />
					</linearGradient>
				);
			})}
		</defs>
	);
}
