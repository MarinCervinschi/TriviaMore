import { forwardRef } from "react";

import IconBase from "@solar-icons/react/lib/IconBase";
import type { Icon, IconProps } from "@solar-icons/react/lib/types";

// Solar carries ✕, ＋, −, ✓ and ● only wrapped in a circle or a square, and these marks are
// interface punctuation rather than iconography — a circled tick inside a square checkbox is wrong.
// Drawn on Solar's IconBase so they inherit its 1.5 stroke, 1em sizing and automatic aria-hidden,
// and are therefore interchangeable with a real icon at the call site.

export const CloseGlyph: Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
	<IconBase ref={ref} {...props} iconName="close-glyph">
		<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeLinecap="round" />
	</IconBase>
));
CloseGlyph.displayName = "CloseGlyph";

export const PlusGlyph: Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
	<IconBase ref={ref} {...props} iconName="plus-glyph">
		<path d="M5 12H19M12 5V19" stroke="currentColor" strokeLinecap="round" />
	</IconBase>
));
PlusGlyph.displayName = "PlusGlyph";

export const MinusGlyph: Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
	<IconBase ref={ref} {...props} iconName="minus-glyph">
		<path d="M5 12H19" stroke="currentColor" strokeLinecap="round" />
	</IconBase>
));
MinusGlyph.displayName = "MinusGlyph";

export const CheckGlyph: Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
	<IconBase ref={ref} {...props} iconName="check-glyph">
		<path
			d="M5 13L9.5 17.5L19 7"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</IconBase>
));
CheckGlyph.displayName = "CheckGlyph";

export const DotGlyph: Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
	<IconBase ref={ref} {...props} iconName="dot-glyph">
		<circle cx="12" cy="12" r="10" fill="currentColor" />
	</IconBase>
));
DotGlyph.displayName = "DotGlyph";
