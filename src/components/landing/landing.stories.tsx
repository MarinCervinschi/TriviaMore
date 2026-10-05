import type { Meta, StoryObj } from "@storybook/react-vite";

import { BenefitsSection } from "./benefits-section";
import { ContentExplorer } from "./content-explorer";
import {
	benefits,
	ctaCardContent,
	features,
	footerSections,
	heroContent,
	showcaseFeatures,
} from "./data";
import { FeatureShowcase } from "./feature-showcase";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { OrbitingTechStack } from "./orbiting-tech-stack";
import { PlatformStatsSection } from "./platform-stats";
import {
	PostgreSQLIcon,
	ReactIcon,
	SupabaseIcon,
	TailwindIcon,
	TanStackIcon,
	TypeScriptIcon,
} from "./tech-icons";

const meta = {
	title: "Landing/Sezioni",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
	render: () => <HeroSection {...heroContent} />,
};

export const Features: Story = {
	render: () => <FeaturesSection features={features} />,
};

export const Benefits: Story = {
	render: () => <BenefitsSection benefits={benefits} ctaCard={ctaCardContent} />,
};

export const Showcase: Story = {
	render: () => <FeatureShowcase features={showcaseFeatures} />,
};

export const Stats: Story = {
	render: () => (
		<div className="divide-border divide-y">
			<PlatformStatsSection
				stats={{
					departments: 14,
					courses: 36,
					classes: 412,
					sections: 1_240,
					questions: 12_480,
				}}
			/>
			<PlatformStatsSection
				stats={{ departments: 0, courses: 0, classes: 0, sections: 0, questions: 0 }}
			/>
		</div>
	),
};

export const Explorer: Story = { render: () => <ContentExplorer /> };

export const TechStack: Story = {
	name: "Orbiting tech stack",
	render: () => (
		<div className="flex min-h-96 items-center justify-center">
			<OrbitingTechStack />
		</div>
	),
};

export const Footer: Story = {
	render: () => <LandingFooter sections={footerSections} />,
};

export const TechIcons: Story = {
	name: "Le icone dello stack",
	parameters: { layout: "padded" },
	render: () => (
		<div className="flex flex-wrap items-center gap-8">
			{(
				[
					["React", ReactIcon],
					["TypeScript", TypeScriptIcon],
					["Tailwind", TailwindIcon],
					["Supabase", SupabaseIcon],
					["PostgreSQL", PostgreSQLIcon],
					["TanStack", TanStackIcon],
				] as const
			).map(([label, Icon]) => (
				<div key={label} className="flex flex-col items-center gap-2">
					<Icon size={40} />
					<span className="text-muted-foreground text-xs">{label}</span>
				</div>
			))}
		</div>
	),
};
