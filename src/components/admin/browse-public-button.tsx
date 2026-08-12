import { EyeIcon } from "@solar-icons/react/linear/eye";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

type BrowsePublicButtonProps = {
	to: string;
	params?: Record<string, string>;
};

export function BrowsePublicButton({ to, params }: BrowsePublicButtonProps) {
	return (
		<Button variant="outline" size="sm" asChild>
			<Link to={to} params={params}>
				<EyeIcon className="text-brand mr-1.5 h-4 w-4" />
				Vedi pubblica
			</Link>
		</Button>
	);
}
