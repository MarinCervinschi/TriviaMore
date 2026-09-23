import type { ComponentProps, ReactNode } from "react";

import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";

/**
 * The "and the rest is over here" link a block carries in its header or footer.
 * Always the button's `sm`, so it never out-weighs the block it hangs off.
 */
export function SeeAllLink({
	icon: Icon,
	children,
	...link
}: { icon: Icon; children: ReactNode } & ComponentProps<typeof Link>) {
	return (
		<Button asChild variant="ghost" size="sm" className="group">
			<Link {...link} className="flex items-center gap-1.5">
				<Icon className="size-3.5" />
				{children}
				<ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
			</Link>
		</Button>
	);
}
