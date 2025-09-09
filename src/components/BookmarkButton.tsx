"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBookmarkCheck, useBookmarkToggle } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
	questionId: string;
	isGuest?: boolean;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "ghost" | "outline";
	className?: string;
}

export function BookmarkButton({
	questionId,
	isGuest = false,
	size = "md",
	variant = "ghost",
	className,
}: BookmarkButtonProps) {
	const session = useSession();
	const userId: string | undefined = session?.data?.user?.id;
	const { data: bookmarkData, isLoading } = useBookmarkCheck(
		userId,
		questionId,
		!isGuest
	);
	const toggleBookmark = useBookmarkToggle(userId, questionId);

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isGuest) {
			return;
		}
		toggleBookmark.mutate();
	};

	const isBookmarked = bookmarkData?.bookmarked || false;
	const isDisabled = isGuest || isLoading || toggleBookmark.isPending;

	const getSizeClasses = () => {
		switch (size) {
			case "sm":
				return "h-8 w-8";
			case "lg":
				return "h-12 w-12";
			default:
				return "h-10 w-10";
		}
	};

	const getIconSize = () => {
		switch (size) {
			case "sm":
				return "h-3 w-3";
			case "lg":
				return "h-5 w-5";
			default:
				return "h-4 w-4";
		}
	};

	if (isGuest) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant={variant}
							size="icon"
							disabled
							onClick={e => e.stopPropagation()}
							className={cn(getSizeClasses(), "opacity-50", className)}
						>
							<Bookmark className={getIconSize()} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Accedi per salvare le domande</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={variant}
						size="icon"
						onClick={handleToggle}
						disabled={isDisabled}
						className={cn(
							getSizeClasses(),
							isBookmarked && "text-blue-600 hover:text-blue-700",
							className
						)}
					>
						{isBookmarked ? (
							<BookmarkCheck className={getIconSize()} />
						) : (
							<Bookmark className={getIconSize()} />
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
