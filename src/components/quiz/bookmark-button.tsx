import { BookmarkIcon as BookmarkFilledIcon } from "@solar-icons/react/bold/bookmark";
import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { useQuery } from "@tanstack/react-query";

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
						aria-label={
							isBookmarked ? "Rimuovi dai segnalibri" : "Aggiungi ai segnalibri"
						}
						className={cn(
							"h-9 w-9 transition-all",
							isBookmarked && "text-brand hover:text-brand/80",
							className
						)}
					>
						<span aria-hidden className="relative inline-flex size-4">
							<BookmarkIcon
								className={cn(
									"absolute inset-0 size-4 transition-transform duration-200 motion-reduce:transition-none",
									isBookmarked ? "scale-0" : "scale-100"
								)}
							/>
							<BookmarkFilledIcon
								className={cn(
									"absolute inset-0 size-4 transition-transform duration-200 motion-reduce:transition-none",
									isBookmarked ? "scale-100" : "scale-0"
								)}
							/>
						</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{isBookmarked ? "Rimuovi dai segnalibri" : "Aggiungi ai segnalibri"}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
