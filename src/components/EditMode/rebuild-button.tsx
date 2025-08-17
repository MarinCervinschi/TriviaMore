"use client";

import { useState } from "react";

import { Loader2, Repeat2 } from "lucide-react";

import { ConfirmationDialog } from "@/components//ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RebuildButtonProps {
	isLoading: boolean;
	onClick: () => void;
	className?: string;
	size?: "sm" | "default" | "lg";
	variant?: "default" | "outline" | "ghost";
}

export function RebuildButton({
	isLoading,
	onClick,
	className,
	size = "default",
}: RebuildButtonProps) {
	const [open, setOpen] = useState(false);

	const handleConfirm = () => {
		setOpen(false);
		onClick();
	};

	return (
		<>
			<Button
				disabled={isLoading}
				onClick={() => setOpen(true)}
				size={size}
				variant="outline"
				className={cn(
					"flex items-center gap-2 border-dashed border-primary text-primary hover:bg-primary/10",
					className
				)}
			>
				{isLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Repeat2 className="h-4 w-4" />
				)}
				Rebuild
			</Button>
			<ConfirmationDialog
				open={open}
				onOpenChange={setOpen}
				title="Confirm Rebuild"
				description="Are you sure you want to rebuild?"
				confirmText="Confirm"
				cancelText="Cancel"
				onConfirm={handleConfirm}
			/>
		</>
	);
}
