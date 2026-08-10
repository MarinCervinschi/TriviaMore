import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";

import { Input } from "@/components/ui/input";

export function SearchFilter({
	value,
	onChange,
	placeholder = "Cerca...",
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}) {
	return (
		<div className="relative mb-6">
			<MagnifierIcon className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
			<Input
				type="search"
				placeholder={placeholder}
				value={value}
				onChange={e => onChange(e.target.value)}
				className="h-11 pl-10"
			/>
		</div>
	);
}
