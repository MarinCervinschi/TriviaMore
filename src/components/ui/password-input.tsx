import * as React from "react";

import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// A password field with a show/hide toggle. Owns its own visibility state and
// forwards every input prop (including react-hook-form's `field`) to the Input.
const PasswordInput = React.forwardRef<
	HTMLInputElement,
	Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
	const [show, setShow] = React.useState(false);

	return (
		<div className="relative">
			<Input
				type={show ? "text" : "password"}
				className={cn("pr-10", className)}
				ref={ref}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setShow(value => !value)}
				className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
				tabIndex={-1}
			>
				{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				<span className="sr-only">
					{show ? "Nascondi password" : "Mostra password"}
				</span>
			</button>
		</div>
	);
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
