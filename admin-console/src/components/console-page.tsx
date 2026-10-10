import type { ReactNode } from "react";

import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { Link, type LinkProps } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

/** A console page: its title and actions on top, the content below. */
export function ConsolePage({
	title,
	description,
	actions,
	back,
	children,
}: {
	title: string;
	/** The page one level up, for a detail page: its link and its name. */
	back?: { label: string } & Pick<LinkProps, "to" | "params" | "search">;
	description?: string;
	actions?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="space-y-6 px-4 py-6 sm:px-6">
			<div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
				<div className="flex min-w-0 items-start gap-2">
					{back && (
						<Button
							asChild
							variant="ghost"
							size="icon"
							className="-ml-2 size-8 shrink-0"
						>
							<Link
								to={back.to}
								params={back.params}
								search={back.search}
								aria-label={`Torna a ${back.label}`}
							>
								<AltArrowLeftIcon className="size-5" />
							</Link>
						</Button>
					)}
					<div className="min-w-0">
						<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
						{description && (
							<p className="text-muted-foreground mt-1 max-w-2xl text-sm">
								{description}
							</p>
						)}
					</div>
				</div>
				{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
			</div>
			{children}
		</div>
	);
}
