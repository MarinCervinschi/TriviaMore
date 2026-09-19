import { useMemo, useState } from "react";

import {
	OnboardingPicker,
	type PickerOption,
} from "@/components/onboarding/onboarding-picker";
import { SegmentedControl } from "@/components/ui/segmented-control";

export type CourseKind = "BACHELOR" | "MASTER" | "SINGLE_CYCLE";

export interface CourseOption extends PickerOption {
	courseType: CourseKind;
}

const KIND_LABEL: Record<CourseKind, string> = {
	BACHELOR: "Triennale",
	MASTER: "Magistrale",
	SINGLE_CYCLE: "Ciclo unico",
};

const KIND_ORDER: CourseKind[] = ["BACHELOR", "MASTER", "SINGLE_CYCLE"];

/** Only the types the department actually offers get a segment: five of thirteen
 *  run single-cycle degrees, and a segment that selects nothing is worse than
 *  one fewer. */
export function CoursePicker({
	options,
	suggestions = [],
	value,
	onSelect,
}: {
	options: CourseOption[];
	suggestions?: CourseOption[];
	value?: string | null;
	onSelect: (id: string) => void;
}) {
	const kinds = useMemo(
		() => KIND_ORDER.filter(kind => options.some(option => option.courseType === kind)),
		[options]
	);

	const [kind, setKind] = useState<CourseKind | undefined>(kinds[0]);
	const active = kind && kinds.includes(kind) ? kind : kinds[0];

	const visible = options.filter(option => option.courseType === active);
	const visibleSuggestions = suggestions.filter(option => option.courseType === active);

	return (
		<div className="flex flex-col gap-3">
			{kinds.length > 1 && (
				<SegmentedControl
					label="Tipo di corso"
					value={active ?? "BACHELOR"}
					onChange={setKind}
					options={kinds.map(item => ({
						value: item,
						label: KIND_LABEL[item],
						count: options.filter(option => option.courseType === item).length,
					}))}
					className="self-start"
				/>
			)}
			<OnboardingPicker
				options={visible}
				suggestions={visibleSuggestions}
				value={value}
				onSelect={onSelect}
				placeholder="Cerca un corso…"
				emptyLabel="Nessun corso trovato."
			/>
		</div>
	);
}
