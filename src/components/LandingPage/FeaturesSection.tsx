import { FeatureCardComponent } from "./FeatureCard";
import { FeatureCard } from "./types";

interface FeaturesSectionProps {
	features: FeatureCard[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
	return (
		<section className="bg-white py-16 dark:bg-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
						Everything You Need to Succeed
					</h2>
					<p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
						Our comprehensive platform provides all the tools you need for effective
						studying and exam preparation.
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
