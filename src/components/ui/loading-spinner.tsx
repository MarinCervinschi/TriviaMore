"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
	size?: "sm" | "default" | "lg";
	className?: string;
	text?: string;
}

export function LoadingSpinner({
	size = "default",
	className,
	text,
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		default: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<div className={cn("flex items-center justify-center gap-2", className)}>
			<Loader2 className={cn("animate-spin", sizeClasses[size])} />
			{text && <span className="text-sm text-muted-foreground">{text}</span>}
		</div>
	);
}
