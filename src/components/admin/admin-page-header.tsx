import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconStack } from "@/components/ui/icon-stack";

type AdminPageHeaderProps = {
	title: string;
	description?: string;
	icon?: Icon;
	backTo?: string;
	backParams?: Record<string, string>;
	backLabel?: string;
	actions?: React.ReactNode;
};

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
		<div className="border-border/50 mb-8 border-b pb-6">
			{backTo && (
				<div className="mb-4">
					{backLabel && <p className="text-brand eyebrow mb-1">{backLabel}</p>}
					<Button variant="ghost" size="sm" className="-ml-2" asChild>
						<Link to={backTo} params={backParams}>
							<ArrowLeftIcon className="mr-1 h-4 w-4" />
							Indietro
						</Link>
					</Button>
				</div>
			)}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					{Icon && (
						<IconStack className="shrink-0">
							<Icon className="text-brand h-7 w-7" />
						</IconStack>
					)}
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
						{description && <p className="text-muted-foreground mt-1">{description}</p>}
					</div>
				</div>
				{actions && <div className="flex items-center gap-2">{actions}</div>}
			</div>
		</div>
	);
}
