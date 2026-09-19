import type { ReactNode } from "react";

import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";

import { Spinner } from "@/components/icons";
import {
	type OnboardingStep,
	OnboardingSteps,
} from "@/components/onboarding/onboarding-steps";
import { Button } from "@/components/ui/button";
import { InsetCard } from "@/components/ui/inset-card";

/** The frame every step is shown in. It owns no step state — the route does —
 *  so the same frame serves the signup flow and a later edit. */
export function OnboardingWizard({
	steps,
	current,
	maxReachable,
	onStepSelect,
	title,
	description,
	children,
	onPrevious,
	onNext,
	nextLabel = "Avanti",
	nextDisabled = false,
	isSubmitting = false,
	onSkip,
	skipLabel = "Lo faccio dopo",
}: {
	steps: OnboardingStep[];
	current: number;
	/** The furthest step reached, so the rail can send the user back to it. */
	maxReachable?: number;
	onStepSelect?: (index: number) => void;
	title: string;
	description?: string;
	children: ReactNode;
	onPrevious?: () => void;
	onNext: () => void;
	nextLabel?: string;
	nextDisabled?: boolean;
	isSubmitting?: boolean;
	onSkip?: () => void;
	skipLabel?: string;
}) {
	return (
		<InsetCard
			header={
				<OnboardingSteps
					steps={steps}
					current={current}
					maxReachable={maxReachable}
					onStepSelect={onStepSelect}
				/>
			}
			bandClassName="px-4 py-3"
			footer={
				<div className="flex items-center justify-between gap-3">
					{onSkip ? (
						<Button variant="ghost" size="sm" onClick={onSkip} disabled={isSubmitting}>
							{skipLabel}
						</Button>
					) : (
						<span />
					)}
					<div className="flex items-center gap-2">
						{onPrevious && (
							<Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
								<AltArrowLeftIcon className="size-4" />
								Indietro
							</Button>
						)}
						<Button onClick={onNext} disabled={nextDisabled || isSubmitting}>
							{isSubmitting ? <Spinner className="size-4" /> : null}
							{nextLabel}
							{!isSubmitting && <AltArrowRightIcon className="size-4" />}
						</Button>
					</div>
				</div>
			}
		>
			<div className="flex flex-col gap-4 p-4 sm:p-5">
				<div className="space-y-1">
					<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
					{description && (
						<p className="text-muted-foreground text-sm">{description}</p>
					)}
				</div>
				{children}
			</div>
		</InsetCard>
	);
}
