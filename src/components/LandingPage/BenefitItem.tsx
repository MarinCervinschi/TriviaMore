import { CheckCircle } from "lucide-react";

import { BenefitItem } from "./types";

interface BenefitItemComponentProps {
	benefit: BenefitItem;
}

export function BenefitItemComponent({ benefit }: BenefitItemComponentProps) {
	return (
		<div className="flex items-start gap-3">
			<CheckCircle className="mt-0.5 h-6 w-6 text-green-500" />
			<div>
				<h3 className="font-semibold dark:text-white">{benefit.title}</h3>
				<p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
			</div>
		</div>
	);
}
