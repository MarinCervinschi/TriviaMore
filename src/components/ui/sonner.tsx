import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/hooks/useTheme";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			style={
				{
					"--border-radius": "var(--radius-xl)",
					"--normal-bg": "hsl(var(--popover))",
					"--normal-text": "hsl(var(--popover-foreground))",
					"--normal-border": "hsl(var(--border))",
				} as React.CSSProperties
			}
			duration={5000}
			closeButton
			gap={12}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:shadow-lg! group-[.toaster]:border-l-4! group-data-[type=success]:border-l-success! group-data-[type=error]:border-l-destructive! group-data-[type=warning]:border-l-warning! group-data-[type=info]:border-l-info!",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary! group-[.toast]:text-primary-foreground! group-[.toast]:rounded-xl! group-[.toast]:h-8! group-[.toast]:px-3.5! group-[.toast]:text-xs! group-[.toast]:font-semibold!",
					cancelButton:
						"group-[.toast]:bg-muted! group-[.toast]:text-muted-foreground! group-[.toast]:rounded-xl! group-[.toast]:h-8! group-[.toast]:px-3.5! group-[.toast]:text-xs! group-[.toast]:font-semibold!",
					closeButton: "group-[.toast]:text-muted-foreground",
					icon: "group-data-[type=error]:text-danger group-data-[type=success]:text-success group-data-[type=warning]:text-warning group-data-[type=info]:text-info",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
