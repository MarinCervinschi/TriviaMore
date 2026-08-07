import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				"border-input placeholder:text-muted-foreground focus-visible:ring-ring ring-offset-background flex min-h-[60px] w-full rounded-xl border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:shadow-[0_0_12px_hsl(var(--ring)/0.15)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };
