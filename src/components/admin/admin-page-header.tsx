import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { Button } from "@/components/ui/button";

type AdminPageHeaderProps = {
	title: string;
	description?: string;
	icon?: Icon;
	backTo?: string;
	backParams?: Record<string, string>;
	backLabel?: string;
	actions?: React.ReactNode;
};

/**
 * The admin head is `PageToolbar` plus the one thing the rest of the app has no use
 * for: a way back up the catalogue, which the deep entity pages are reached through.
 */
export function AdminPageHeader({
	title,
	description,
	icon: Icon,
	backTo,
	backParams,
	backLabel,
	actions,
}: AdminPageHeaderProps) {
	return (
		<div className="mb-6">
			{backTo && (
				<div className="mb-3">
					{backLabel && <p className="text-brand eyebrow mb-1">{backLabel}</p>}
					<Button variant="ghost" size="sm" className="-ml-2" asChild>
						<Link to={backTo} params={backParams}>
							<ArrowLeftIcon className="mr-1 h-4 w-4" />
							Indietro
						</Link>
					</Button>
				</div>
			)}
			<PageToolbar
				title={
					Icon ? (
						<span className="flex min-w-0 items-center gap-2">
							<Icon className="text-brand size-5 shrink-0" />
							<span className="truncate">{title}</span>
						</span>
					) : (
						title
					)
				}
				meta={description}
				actions={actions}
			/>
		</div>
	);
}
