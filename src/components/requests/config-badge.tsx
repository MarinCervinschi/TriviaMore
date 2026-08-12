import type { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Config-map-driven outline pill shared by the request status/type badges: the
// caller supplies the label, the (static) colour classes, and an optional icon.
export function ConfigBadge({
	label,
	className,
	icon: Icon,
}: {
	label: string;
	className: string;
	icon?: Icon;
}) {
	return (
		<Badge
			variant="outline"
			className={cn("inline-flex items-center gap-1 text-xs font-medium", className)}
		>
			{Icon && <Icon className="size-3" />}
			{label}
		</Badge>
	);
}
