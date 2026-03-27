import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			aria-hidden="true"
			role="presentation"
			className={cn(
				"shimmer rounded-xl",
				className
			)}
			{...props}
		/>
	);
}

export { Skeleton };
