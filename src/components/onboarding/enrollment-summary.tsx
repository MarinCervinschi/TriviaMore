import { useEffect, useRef, useState } from "react";

import { DiplomaVerifiedIcon } from "@solar-icons/react/bold/diploma-verified";
import { Link } from "@tanstack/react-router";

import { IconTile } from "@/components/ui/icon-tile";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import type { CurrentEnrollment } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

/** The medal's lighting on the tile's shape: the accent lit from the top left,
 *  as `achievement-medal` draws it in SVG. */
const GLOSS =
	"bg-[radial-gradient(circle_at_32%_24%,rgb(255_255_255/0.5),rgb(255_255_255/0.16)_45%,transparent)]";

/**
 * Whether the clamped name is really cut. Measured rather than counted, as
 * `app-breadcrumb` does for its width: the catalogue runs from 6 to 70
 * characters and the same count wraps differently depending on how narrow they
 * are, so counting puts a tooltip on names that render in full.
 */
function useIsClamped<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [clamped, setClamped] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		// A pixel of tolerance: sub-pixel rounding otherwise reports a cut that is not there.
		const measure = () => setClamped(node.scrollHeight > node.clientHeight + 1);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return [ref, clamped] as const;
}

/**
 * The hero counterpart of the prompt: once the course is declared, the slot
 * states it instead of asking for it. `auth-card`'s glass without its frame —
 * and no border colour, because the unlayered `*` rule in `globals.css` beats
 * every border-color utility, which is why auth's own `border-white/10` never
 * painted.
 */
export function EnrollmentSummary({ enrollment }: { enrollment: CurrentEnrollment }) {
	const [nameRef, clamped] = useIsClamped<HTMLAnchorElement>();

	return (
		<div className="bg-card/80 dark:bg-card/60 w-full overflow-hidden rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl lg:w-80 lg:shrink-0">
			<div className="flex items-center gap-3">
				{/* The fill is `bg-current`, so the accent stays here and the glyph
				    carries its own colour — the two on one element paint the same. */}
				<IconTile
					size="sm"
					variant="solid"
					className="text-brand relative overflow-hidden bg-current"
				>
					<span
						aria-hidden
						className={cn("absolute inset-0 rounded-[inherit]", GLOSS)}
					/>
					<DiplomaVerifiedIcon className="text-card relative" />
				</IconTile>
				<div className="min-w-0 flex-1">
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									ref={nameRef}
									to="/browse/$department/$course"
									params={{
										department: enrollment.departmentCode.toLowerCase(),
										course: enrollment.courseCode.toLowerCase(),
									}}
									className="line-clamp-2 text-sm font-semibold underline-offset-2 hover:underline"
								>
									{enrollment.courseName}
								</Link>
							</TooltipTrigger>
							{/* Only the content is conditional: wrapping the name itself would
							    remount it and leave the observer on a detached node. */}
							{clamped && (
								<TooltipContent className="max-w-72">
									{enrollment.courseName}
								</TooltipContent>
							)}
						</Tooltip>
					</TooltipProvider>
					<p className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
						<span className="shrink-0 font-mono">{enrollment.departmentCode}</span>
						<span aria-hidden>·</span>
						<span className="truncate">
							{COURSE_TYPE_CONFIG[enrollment.courseType]?.label}
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
