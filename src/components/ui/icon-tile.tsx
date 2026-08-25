import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * A square surface for a single icon — adapted from ReUI's Icon Tile to our
 * tokens (Base UI composition dropped, `text-primary` → `text-brand` per D19,
 * raw shadow → `shadow-sm`). `soft` and `frame` paint their inner card with an
 * `::after`, so no extra node is needed. Tint `soft` / `solid` by setting a text
 * colour on the tile — e.g. `text-chart-1-ink` for a per-metric identity.
 */
const iconTileVariants = cva(
	"relative inline-flex size-(--icon-tile-size) shrink-0 items-center justify-center rounded-(--icon-tile-radius) align-middle [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-(--icon-tile-icon-size)",
	{
		variants: {
			variant: {
				outline: "border-border bg-background dark:bg-input/32 border",
				elevated:
					"border-background bg-muted text-accent-foreground border-2 shadow-[0_1px_3px_0_rgb(0_0_0/0.14)] dark:border",
				soft: "text-brand isolate bg-current/10 p-(--icon-tile-inset) after:absolute after:inset-(--icon-tile-inset) after:-z-10 after:rounded-[calc(var(--icon-tile-radius)-var(--icon-tile-inset))] after:border after:border-current/20 after:bg-current/5",
				solid: "bg-primary text-primary-foreground",
				frame:
					"border-border bg-muted/50 isolate border p-(--icon-tile-inset) after:absolute after:inset-(--icon-tile-inset) after:-z-10 after:rounded-[calc(var(--icon-tile-radius)-var(--icon-tile-inset))] after:border after:border-border after:bg-card after:shadow-xs",
			},
			size: {
				xs: "[--icon-tile-icon-size:--spacing(3.5)] [--icon-tile-inset:--spacing(0.5)] [--icon-tile-size:--spacing(6)]",
				sm: "[--icon-tile-icon-size:--spacing(4)] [--icon-tile-inset:--spacing(0.5)] [--icon-tile-size:--spacing(8)]",
				default:
					"[--icon-tile-icon-size:--spacing(4.5)] [--icon-tile-inset:--spacing(0.75)] [--icon-tile-size:--spacing(10)]",
				lg: "[--icon-tile-icon-size:--spacing(5.5)] [--icon-tile-inset:--spacing(0.75)] [--icon-tile-size:--spacing(12)]",
				xl: "[--icon-tile-icon-size:--spacing(7)] [--icon-tile-inset:--spacing(1)] [--icon-tile-size:--spacing(14)]",
			},
			radius: {
				default:
					"[--icon-tile-radius:min(var(--radius-md),calc(var(--icon-tile-size)/3))]",
				full: "[--icon-tile-radius:calc(infinity*1px)]",
			},
		},
		defaultVariants: { variant: "outline", size: "default", radius: "default" },
	}
);

export interface IconTileProps
	extends
		React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof iconTileVariants> {}

function IconTile({ className, variant, size, radius, ...props }: IconTileProps) {
	return (
		<span
			data-slot="icon-tile"
			className={cn(iconTileVariants({ variant, size, radius }), className)}
			{...props}
		/>
	);
}

export { IconTile, iconTileVariants };
