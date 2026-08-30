import { StarIcon as StarFilledIcon } from "@solar-icons/react/bold/star";
import { StarIcon } from "@solar-icons/react/linear/star";

import { Button } from "@/components/ui/button";
import { useAttemptFavorite } from "@/lib/user/mutations";
import { cn } from "@/lib/utils";

/**
 * The star on an attempt. It sends the wanted value rather than a flip, so a
 * second click while the first is in flight settles on what the user last asked
 * for. The icon follows the refetched list, not the click: there is no optimistic
 * patch, so it settles a round trip late.
 */
export function FavoriteStar({
	attemptId,
	isFavorite,
	className,
}: {
	attemptId: string;
	isFavorite: boolean;
	className?: string;
}) {
	const favorite = useAttemptFavorite();

	return (
		<Button
			variant="ghost"
			size="icon"
			className={cn("size-8", className)}
			aria-pressed={isFavorite}
			aria-label={isFavorite ? "Togli dai preferiti" : "Salva tra i preferiti"}
			onClick={() => favorite.mutate({ attemptId, isFavorite: !isFavorite })}
		>
			{isFavorite ? (
				<StarFilledIcon className="text-warning size-4" />
			) : (
				<StarIcon className="size-4" />
			)}
		</Button>
	);
}
