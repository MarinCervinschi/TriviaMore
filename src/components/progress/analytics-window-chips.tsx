import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { LayersIcon } from "@solar-icons/react/linear/layers";

import { type ChipOption, SelectChip } from "@/components/shared/select-chip";
import type { ExplorerMode, ExplorerPeriod } from "@/lib/user/metric-explorer";

const PERIODS: ChipOption<ExplorerPeriod>[] = [
	{ value: "week", label: "Ultima settimana" },
	{ value: "month", label: "Ultimo mese" },
	{ value: "year", label: "Ultimo anno" },
	{ value: "all", label: "Tutto lo storico" },
];

const MODES: ChipOption<ExplorerMode>[] = [
	{ value: "both", label: "Studio + Esame" },
	{ value: "STUDY", label: "Solo studio" },
	{ value: "EXAM_SIMULATION", label: "Solo esame" },
];

/**
 * The window every analytics page reads from the URL. Presentational on purpose:
 * the shell's header wires it from loose search params, the entity pages from their
 * own typed route — the state is the URL either way, so there is only one of it.
 */
export function AnalyticsWindowChips({
	period,
	mode,
	onPeriodChange,
	onModeChange,
}: {
	period: ExplorerPeriod;
	mode: ExplorerMode;
	onPeriodChange: (period: ExplorerPeriod) => void;
	onModeChange: (mode: ExplorerMode) => void;
}) {
	return (
		<>
			<SelectChip
				label="Periodo"
				value={period}
				onChange={onPeriodChange}
				options={PERIODS}
				lead={CalendarMinimalisticIcon}
			/>
			<SelectChip
				label="Modalità"
				value={mode}
				onChange={onModeChange}
				options={MODES}
				lead={LayersIcon}
			/>
		</>
	);
}
