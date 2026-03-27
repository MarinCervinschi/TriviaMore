import { useTheme } from "@/hooks/useTheme";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			duration={5000}
			closeButton
			gap={12}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-sm group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:border-l-4 group-data-[type=success]:border-l-green-500 group-data-[type=error]:border-l-red-500 group-data-[type=warning]:border-l-amber-500 group-data-[type=info]:border-l-blue-500",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl",
					cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl",
					closeButton: "group-[.toast]:text-muted-foreground",
					icon: "group-data-[type=error]:text-red-500 group-data-[type=success]:text-green-500 group-data-[type=warning]:text-amber-500 group-data-[type=info]:text-blue-500",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
