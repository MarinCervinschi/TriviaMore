import { BenefitItemComponent } from "./BenefitItem";
import { CTACard } from "./CTACard";
import type { BenefitItem, CTACardProps } from "./types";

interface BenefitsSectionProps {
	benefits: BenefitItem[];
	ctaCard: CTACardProps;
}

export function BenefitsSection({ benefits, ctaCard }: BenefitsSectionProps) {
	return (
		<section className="bg-gray-50 py-16 dark:bg-gray-900">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
					<div>
						<h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
							Perché gli studenti scelgono Trivia More
						</h2>
						<div className="space-y-4">
							{benefits.map((benefit, index) => (
								<BenefitItemComponent key={index} benefit={benefit} />
							))}
						</div>
					</div>
					<CTACard {...ctaCard} />
				</div>
			</div>
		</section>
	);
}
