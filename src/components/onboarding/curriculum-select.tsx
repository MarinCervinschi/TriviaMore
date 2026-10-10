import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CurriculumOption } from "@/lib/crm/types";

/** The curriculum of the student's cohort, among those `crmQueries.curriculumOptions` returns. */
export function CurriculumSelect({
	options,
	value,
	onChange,
	disabled,
	className,
	id,
}: {
	options: CurriculumOption[];
	value: string | null;
	onChange: (curriculumId: string) => void;
	disabled?: boolean;
	className?: string;
	id?: string;
}) {
	return (
		<Select
			value={value && options.some(option => option.id === value) ? value : undefined}
			onValueChange={onChange}
			disabled={disabled}
		>
			<SelectTrigger id={id} className={className}>
				<SelectValue placeholder="Scegli il curriculum" />
			</SelectTrigger>
			<SelectContent>
				{options.map(option => (
					<SelectItem key={option.id} value={option.id}>
						{option.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
