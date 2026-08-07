import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

type BrowsePublicButtonProps = {
	to: string;
	params?: Record<string, string>;
};

export function BrowsePublicButton({ to, params }: BrowsePublicButtonProps) {
	return (
		<Button variant="outline" size="sm" className="rounded-xl" asChild>
			<Link to={to} params={params}>
				<Eye className="text-primary mr-1.5 h-4 w-4" />
				Vedi pubblica
			</Link>
		</Button>
	);
}
