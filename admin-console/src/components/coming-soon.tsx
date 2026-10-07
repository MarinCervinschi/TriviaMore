import { SquareArrowRightUpIcon } from "@solar-icons/react/linear/square-arrow-right-up";

import type { Icon } from "@/components/icons";
import { InsetCard } from "@/components/ui/inset-card";

const ISSUES = "https://github.com/MarinCervinschi/TriviaMore/issues";

/** A page that exists in the navigation and is built in a later issue. */
export function ComingSoon({
	icon: Glyph,
	title,
	description,
	issue,
}: {
	icon: Icon;
	title: string;
	description: string;
	issue: number;
}) {
	return (
		<InsetCard>
			<div className="flex flex-col items-center px-6 py-14 text-center">
				<span className="bg-muted text-muted-foreground mb-4 flex size-11 items-center justify-center rounded-xl border">
					<Glyph className="size-5" />
				</span>
				<h2 className="text-base font-semibold">{title}</h2>
				<p className="text-muted-foreground mt-1 max-w-md text-sm">{description}</p>
				<a
					href={`${ISSUES}/${issue}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-muted-foreground hover:text-brand mt-4 inline-flex items-center gap-1 text-sm transition-colors motion-reduce:transition-none"
				>
					<SquareArrowRightUpIcon className="size-4" />
					Issue #{issue}
				</a>
			</div>
		</InsetCard>
	);
}
