import * as React from "react";

import { EyeIcon } from "@solar-icons/react/linear/eye";
import { EyeClosedIcon } from "@solar-icons/react/linear/eye-closed";

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
				<span aria-hidden className="relative inline-flex size-4">
					<EyeIcon
						className={cn(
							"absolute inset-0 size-4 transition-transform duration-200 motion-reduce:transition-none",
							show ? "scale-0" : "scale-100"
						)}
					/>
					<EyeClosedIcon
						className={cn(
							"absolute inset-0 size-4 transition-transform duration-200 motion-reduce:transition-none",
							show ? "scale-100" : "scale-0"
						)}
					/>
				</span>
				<span className="sr-only">
					{show ? "Nascondi password" : "Mostra password"}
				</span>
			</button>
		</div>
	);
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
