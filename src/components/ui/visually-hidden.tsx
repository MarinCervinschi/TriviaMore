import * as React from "react";

import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";

const VisuallyHidden = React.forwardRef<
	React.ElementRef<typeof VisuallyHiddenPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof VisuallyHiddenPrimitive.Root>
>(({ ...props }, ref) => <VisuallyHiddenPrimitive.Root {...props} ref={ref} />);

VisuallyHidden.displayName = VisuallyHiddenPrimitive.Root.displayName;

export { VisuallyHidden };
