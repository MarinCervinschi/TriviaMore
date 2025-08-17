import { BenefitsSection } from "./BenefitsSection";
import { FeaturesSection } from "./FeaturesSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import {
	benefits,
	ctaCardContent,
	features,
	footerSections,
	heroContent,
} from "./data";

export function LandingPageContent() {
	return (
		<>
			<HeroSection {...heroContent} />
			<FeaturesSection features={features} />
			<BenefitsSection benefits={benefits} ctaCard={ctaCardContent} />
			<LandingFooter sections={footerSections} />
		</>
	);
}
