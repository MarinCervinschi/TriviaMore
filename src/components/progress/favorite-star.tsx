import { StarIcon as StarFilledIcon } from "@solar-icons/react/bold/star";
import { StarIcon } from "@solar-icons/react/linear/star";

import { Button } from "@/components/ui/button";
import { useAttemptFavorite } from "@/lib/user/mutations";
import { cn } from "@/lib/utils";

/** Sends the wanted value, so a second click in flight settles on the last one asked for. */
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
