import { Moon, Sun } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeIconsProps {
	className?: string;
	strokeWidth?: number;
}

export function ThemeIcons({ className, strokeWidth = 2 }: ThemeIconsProps) {
	return (
		<span className={cn("relative inline-flex shrink-0", className)}>
			<Sun
				strokeWidth={strokeWidth}
				className="scale-100 rotate-0 transition-transform duration-600 ease-in-out motion-reduce:transition-none dark:scale-0 dark:-rotate-90"
			/>
			<Moon
				strokeWidth={strokeWidth}
				className="absolute inset-0 scale-0 rotate-90 transition-transform duration-600 ease-in-out motion-reduce:transition-none dark:scale-100 dark:rotate-0"
			/>
		</span>
	);
}

interface ThemeToggleProps extends Omit<
	ButtonProps,
	"onClick" | "children" | "asChild"
> {}

export function ThemeToggle({
	variant = "ghost",
	size = "icon",
	className,
	disabled,
	...rest
}: ThemeToggleProps) {
	const { mounted, toggleTheme } = useTheme();

	return (
		<Button
			variant={variant}
			size={size}
			className={cn("rounded-xl", className)}
			onClick={event => toggleTheme(event.nativeEvent)}
			disabled={disabled || !mounted}
			aria-label="Cambia tema"
			{...rest}
		>
			<ThemeIcons />
			<span className="sr-only">Cambia tema</span>
		</Button>
	);
}
