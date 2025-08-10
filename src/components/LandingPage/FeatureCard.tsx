import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FeatureCard } from "./types";

interface FeatureCardComponentProps {
	feature: FeatureCard;
}

export function FeatureCardComponent({ feature }: FeatureCardComponentProps) {
	const IconComponent = feature.icon;

	return (
		<Card>
			<CardHeader>
				<IconComponent className={`mb-2 h-10 w-10 ${feature.iconColor}`} />
				<CardTitle>{feature.title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
			</CardContent>
		</Card>
	);
}
