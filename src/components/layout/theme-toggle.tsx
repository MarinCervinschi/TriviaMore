import { MoonIcon } from "@solar-icons/react/linear/moon";
import { Sun2Icon } from "@solar-icons/react/linear/sun-2";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeIconsProps {
	className?: string;
}

export function ThemeIcons({ className }: ThemeIconsProps) {
	return (
		<span className={cn("relative inline-flex shrink-0", className)}>
			<Sun2Icon className="scale-100 rotate-0 transition-transform duration-600 ease-in-out motion-reduce:transition-none dark:scale-0 dark:-rotate-90" />
			<MoonIcon className="absolute inset-0 scale-0 rotate-90 transition-transform duration-600 ease-in-out motion-reduce:transition-none dark:scale-100 dark:rotate-0" />
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
