import * as React from "react";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { type VariantProps, cva } from "class-variance-authority";

import { CloseGlyph } from "@/components/icons";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<SheetPrimitive.Overlay
		className={cn(
			"bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm",
			className
		)}
		{...props}
		ref={ref}
	/>
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
	"fixed z-50 gap-4 rounded-2xl border border-border/50 bg-popover p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
	{
		variants: {
			side: {
				top: "inset-x-2 top-2 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
				bottom:
					"inset-x-2 bottom-2 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
				left: "inset-y-2 left-2 w-[calc(100%-1rem)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
				right:
					"inset-y-2 right-2 w-[calc(100%-1rem)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
			},
		},
		defaultVariants: {
			side: "right",
		},
	}
);

interface SheetContentProps
	extends
		React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
		VariantProps<typeof sheetVariants> {
	/** `panel` is a form or a detail: a bordered header, a scrolling `SheetBody`, a pinned footer, and its own `SheetTitle`. */
	layout?: "default" | "panel";
}

const SheetContent = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Content>,
	SheetContentProps
>(({ side = "right", layout = "default", className, children, ...props }, ref) => (
	<SheetPortal>
		<SheetOverlay />
		<SheetPrimitive.Content
			ref={ref}
			data-layout={layout}
			className={cn(
				sheetVariants({ side }),
				"group/sheet",
				layout === "panel" && "flex flex-col gap-0 p-0",
				className
			)}
			aria-describedby={undefined}
			{...props}
		>
			{layout === "default" && (
				<VisuallyHidden>
					<SheetPrimitive.Title>Menu</SheetPrimitive.Title>
				</VisuallyHidden>
			)}
			{children}
			<SheetPrimitive.Close className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none">
				<CloseGlyph className="h-4 w-4" />
				<span className="sr-only">Chiudi</span>
			</SheetPrimitive.Close>
		</SheetPrimitive.Content>
	</SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-2 text-center sm:text-left",
			"group-data-[layout=panel]/sheet:border-b group-data-[layout=panel]/sheet:px-5 group-data-[layout=panel]/sheet:pt-5 group-data-[layout=panel]/sheet:pr-12 group-data-[layout=panel]/sheet:pb-4 group-data-[layout=panel]/sheet:text-left",
			className
		)}
		{...props}
	/>
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			"group-data-[layout=panel]/sheet:gap-2 group-data-[layout=panel]/sheet:border-t group-data-[layout=panel]/sheet:px-5 group-data-[layout=panel]/sheet:py-3 group-data-[layout=panel]/sheet:sm:space-x-0",
			className
		)}
		{...props}
	/>
);
SheetFooter.displayName = "SheetFooter";

/** The part of a `panel` sheet that scrolls, between the header and the footer. */
const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5", className)}
		{...props}
	/>
);
SheetBody.displayName = "SheetBody";

const SheetTitle = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
	<SheetPrimitive.Title
		ref={ref}
		className={cn("text-foreground text-lg font-semibold", className)}
		{...props}
	/>
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
	<SheetPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground text-sm", className)}
		{...props}
	/>
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
	Sheet,
	SheetPortal,
	SheetOverlay,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetBody,
	SheetTitle,
	SheetDescription,
};
