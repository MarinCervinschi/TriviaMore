import { useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleBookmark } from "@/lib/user/mutations";
import { userQueries } from "@/lib/user/queries";
import { cn } from "@/lib/utils";

export function BookmarkButton({
	questionId,
	className,
}: {
	questionId: string;
	className?: string;
}) {
	const toggleBookmark = useToggleBookmark();
	const { data: bookmarkedIds } = useQuery(userQueries.bookmarkedIds());
	const isBookmarked = bookmarkedIds?.includes(questionId) ?? false;

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggleBookmark.mutate(questionId);
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleToggle}
						disabled={toggleBookmark.isPending}
						className={cn(
							"h-9 w-9 rounded-xl transition-all",
							isBookmarked && "text-primary hover:text-primary/80",
							className
						)}
					>
						{isBookmarked ? (
							<BookmarkCheck className="h-4 w-4" />
						) : (
							<Bookmark className="h-4 w-4" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{isBookmarked ? "Rimuovi dai segnalibri" : "Aggiungi ai segnalibri"}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
