import { useEffect, useRef } from "react";

import { MapPointIcon } from "@solar-icons/react/linear/map-point";
import { Link } from "@tanstack/react-router";

import {
	Map,
	MapControls,
	MapMarker,
	MarkerContent,
	MarkerPopup,
	useMap,
} from "@/components/browse/map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { CAMPUS_LOCATION_CONFIG } from "@/lib/browse/constants";
import type { OverviewLocation } from "@/lib/browse/types";

function FitAllBounds({ locations }: { locations: OverviewLocation[] }) {
	const { map } = useMap();
	const fitted = useRef(false);

	useEffect(() => {
		if (!map || fitted.current || locations.length === 0) return;
		fitted.current = true;

		const lngs = locations.map(l => Number(l.longitude));
		const lats = locations.map(l => Number(l.latitude));
		map.fitBounds(
			[
				[Math.min(...lngs) - 0.05, Math.min(...lats) - 0.05],
				[Math.max(...lngs) + 0.05, Math.max(...lats) + 0.05],
			],
			{ padding: 48 }
		);
	}, [map, locations]);

	return null;
}

export function OverviewMap({ locations }: { locations: OverviewLocation[] }) {
	const { resolvedTheme } = useTheme();

	if (locations.length === 0) return null;

	const mapTheme = resolvedTheme === "dark" ? "dark" : "light";

	return (
		<Card className="flex h-full flex-col overflow-hidden">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<MapPointIcon className="text-primary h-4 w-4" />
					Le nostre sedi
				</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 p-0">
				<div className="h-full min-h-[300px] w-full">
					<Map
						center={[10.88, 44.68]}
						zoom={9}
						theme={mapTheme}
						className="h-full w-full rounded-b-xl"
					>
						<FitAllBounds locations={locations} />
						<MapControls position="top-right" showZoom showCompass={false} />
						{locations.map(location => (
							<MapMarker
								key={location.id}
								longitude={Number(location.longitude)}
								latitude={Number(location.latitude)}
							>
								<MarkerContent className="bg-primary text-primary-foreground ring-background flex h-9 w-9 items-center justify-center rounded-full shadow-lg ring-2 transition-transform hover:scale-110">
									<MapPointIcon className="h-4 w-4" />
								</MarkerContent>
								<MarkerPopup>
									<div className="min-w-[220px] space-y-2">
										<p className="text-sm leading-snug font-semibold">
											{location.department.name}
										</p>
										<p className="text-muted-foreground text-xs">{location.name}</p>
										<p className="text-muted-foreground text-xs leading-relaxed">
											{location.address}
										</p>
										<div className="flex items-center justify-between gap-2">
											{location.campusLocation && (
												<Badge variant="secondary" className="text-xs">
													{CAMPUS_LOCATION_CONFIG[location.campusLocation]?.label ??
														location.campusLocation}
												</Badge>
											)}
											<Link
												to="/browse/$department"
												params={{ department: location.department.code.toLowerCase() }}
												className="text-primary text-xs font-medium hover:underline"
											>
												Vai al dipartimento
											</Link>
										</div>
									</div>
								</MarkerPopup>
							</MapMarker>
						))}
					</Map>
				</div>
			</CardContent>
		</Card>
	);
}
