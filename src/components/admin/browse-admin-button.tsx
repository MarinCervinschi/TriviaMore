import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { adminQueries } from "@/lib/admin/queries";

type BrowseAdminButtonProps = {
	to: string;
	params?: Record<string, string>;
	// A MAINTAINER sees the button only if this course is one they maintain;
	// omit it (e.g. department page) to hide the button from maintainers.
	courseId?: string;
};

export function BrowseAdminButton({ to, params, courseId }: BrowseAdminButtonProps) {
	const { user } = useAuth();
	const role = user?.role;
	const isFullAdmin = role === "SUPERADMIN" || role === "ADMIN";
	const isMaintainer = role === "MAINTAINER";

	const { data: permissions } = useQuery({
		...adminQueries.permissions(),
		enabled: isMaintainer,
	});

	if (isMaintainer) {
		if (!courseId) return null;
		if (!permissions?.maintainedCourseIds.includes(courseId)) return null;
	} else if (!isFullAdmin) {
		return null;
	}

	return (
		<Button variant="outline" size="sm" className="rounded-xl" asChild>
			<Link to={to} params={params}>
				<Settings className="text-primary mr-1.5 h-4 w-4" />
				Gestisci
			</Link>
		</Button>
	);
}
