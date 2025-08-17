import { FeatureCardComponent } from "./FeatureCard";
import type { FeatureCard } from "./types";

interface FeaturesSectionProps {
	features: FeatureCard[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
	return (
		<section className="bg-white py-16 dark:bg-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
						Tutto quello che ti serve per avere successo
					</h2>
					<p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
						La nostra piattaforma collaborativa fornisce tutti gli strumenti necessari
						per uno studio efficace e una preparazione ottimale agli esami.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					{features.map((feature, index) => (
						<FeatureCardComponent key={index} feature={feature} />
					))}
				</div>
			</div>
		</section>
	);
}
