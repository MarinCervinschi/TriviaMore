import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { AtomIcon } from "@solar-icons/react/linear/atom";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { CityIcon } from "@solar-icons/react/linear/city";
import { CpuIcon } from "@solar-icons/react/linear/cpu";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { HeartPulseIcon } from "@solar-icons/react/linear/heart-pulse";
import { LeafIcon } from "@solar-icons/react/linear/leaf";
import { MapPointIcon } from "@solar-icons/react/linear/map-point";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { AREA_CONFIG, CAMPUS_LOCATION_CONFIG } from "@/lib/browse/constants";
import { cn } from "@/lib/utils";

const AREA_ICONS: Record<string, Icon> = {
	SCIENZE: AtomIcon,
	TECNOLOGIA: CpuIcon,
	SALUTE: HeartPulseIcon,
	VITA: LeafIcon,
	SOCIETA_CULTURA: CityIcon,
};

const AREA_BANNER_TEXT: Record<string, string> = {
	SCIENZE: "text-blue-700 dark:text-blue-300",
	TECNOLOGIA: "text-indigo-700 dark:text-indigo-300",
	SALUTE: "text-rose-700 dark:text-rose-300",
	VITA: "text-emerald-700 dark:text-emerald-300",
	SOCIETA_CULTURA: "text-amber-700 dark:text-amber-300",
};

export type DepartmentCardData = {
	id: string;
	code: string;
	name: string;
	description?: string | null;
	area?: string | null;
	courseCount: number;
	campusLocations: string[];
};

export function DepartmentCard({ department }: { department: DepartmentCardData }) {
	const courseCount = department.courseCount;
	const areaConf = department.area ? AREA_CONFIG[department.area] : null;
	const AreaIcon = department.area ? AREA_ICONS[department.area] : null;
	const areaTextClass = department.area
		? AREA_BANNER_TEXT[department.area]
		: "text-foreground";

	const campuses = [...new Set(department.campusLocations)];

	return (
		<Link
			to="/browse/$department"
			params={{ department: department.code.toLowerCase() }}
			className="group block h-full"
		>
			<article
				className={cn(
					"bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm",
					"transition-all duration-300",
					"hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl"
				)}
			>
				{/* Area banner */}
				<div
					className={cn(
						"relative flex items-center gap-2.5 px-5 py-4",
						"bg-gradient-to-br",
						areaConf?.gradient ?? "from-primary/10 to-primary/5"
					)}
				>
					<div
						className={cn(
							"bg-background/80 ring-border/50 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 backdrop-blur",
							areaTextClass
						)}
					>
						{AreaIcon ? (
							<AreaIcon className="h-4 w-4" />
						) : (
							<BuildingsIcon className="h-4 w-4" />
						)}
					</div>
					<div className="min-w-0 flex-1">
						<p
							className={cn(
								"truncate text-[10px] font-bold tracking-[0.16em] uppercase",
								areaTextClass
							)}
						>
							{areaConf?.label ?? "Area"}
						</p>
						<p className="text-muted-foreground truncate font-mono text-xs">
							{department.code}
						</p>
					</div>
					<div
						className={cn(
							"bg-background/70 ring-border/50 h-7 w-7 shrink-0 rounded-full ring-1 backdrop-blur",
							"flex items-center justify-center transition-transform",
							"group-hover:translate-x-0.5"
						)}
					>
						<ArrowRightIcon
							className={cn("h-3.5 w-3.5 transition-colors", areaTextClass)}
						/>
					</div>
				</div>

				{/* Body */}
				<div className="flex flex-1 flex-col gap-2.5 p-5">
					<h3 className="text-foreground group-hover:text-primary line-clamp-2 text-base leading-tight font-bold tracking-tight transition-colors sm:text-lg">
						{department.name}
					</h3>
					{department.description && (
						<p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed sm:text-sm">
							{department.description}
						</p>
					)}

					{/* Footer */}
					<div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-sm">
						<span className="text-muted-foreground flex items-center gap-1.5">
							<DiplomaIcon className="h-4 w-4" />
							<span className="text-foreground font-semibold tabular-nums">
								{courseCount}
							</span>
							<span className="text-xs sm:text-sm">
								{courseCount === 1 ? "corso" : "corsi"}
							</span>
						</span>
						{campuses.length > 0 && (
							<span className="text-muted-foreground flex items-center gap-1">
								<MapPointIcon className="h-3.5 w-3.5" />
								<span className="flex flex-wrap gap-1">
									{campuses.map(c => (
										<Badge key={c} variant="outline" size="sm" className="font-mono">
											{CAMPUS_LOCATION_CONFIG[c]?.short ?? c}
										</Badge>
									))}
								</span>
							</span>
						)}
					</div>
				</div>
			</article>
		</Link>
	);
}
