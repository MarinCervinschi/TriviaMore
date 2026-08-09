export type ChartFill = "solid" | "gradient" | "hatched";

export type DefSeries = {
	key: string;
	/** Set only for a series whose colour carries meaning. */
	color?: string;
	fill?: ChartFill;
};

/**
 * The SVG `<defs>` every chart shares. Ids are namespaced by the chart's own
 * `useId`, because two charts on one page would otherwise collide — SVG ids are
 * document-global.
 *
 * Two gradients, and the difference matters. Slot 1 gets the **brand ramp**
 * (orange → coral at 135°, the same stops as the CTAs and the quiz bar) because
 * slot 1 *is* the brand orange. Every other series gets a fade of its own hue,
 * which changes opacity only — a hue-shifting wash on a series whose colour
 * carries identity would distort the encoding.
 *
 * `hatched` is the 45° texture and is deliberately never a default: dense angled
 * fields read as noise on a value scale. It is for a mark that means something
 * extra — a folded "Altro" bucket, a period still in progress — or as the print
 * and colour-vision fallback.
 */
export function ChartDefs({
	scope,
	series,
	/** Marks the first slot as the brand series. Off when colours are explicit. */
	brandFirst = false,
}: {
	scope: string;
	series: DefSeries[];
	brandFirst?: boolean;
}) {
	return (
		<defs>
			{/* One 45° mask shared by every hatched fill: the stripe is the colour at
			    full strength, the gap the same colour held back. */}
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

/**
 * The fill a mark should get. Only a per-datum colour forces flat: there is one
 * gradient def per series, so a bar that picks its own colour could not use it.
 */
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

/** The soft fade an area gets under its line — vertical, down to nothing. */
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
