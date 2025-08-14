"use client";

import type { ReactNode } from "react";

import { AlertTriangle, Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditModeOverlayProps {
	isActive: boolean;
	userRole: "SUPERADMIN" | "ADMIN" | "MAINTAINER" | "STUDENT" | null;
	children: ReactNode;
	className?: string;
}

export function EditModeOverlay({
	isActive,
	userRole,
	children,
	className,
}: EditModeOverlayProps) {
	if (!isActive) {
		return <>{children}</>;
	}

	const getRoleColor = (role: string | null) => {
		switch (role) {
			case "SUPERADMIN":
				return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
			case "ADMIN":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200";
			case "MAINTAINER":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
		}
	};

	const getRoleLabel = (role: string | null) => {
		switch (role) {
			case "SUPERADMIN":
				return "Super Amministratore";
			case "ADMIN":
				return "Amministratore";
			case "MAINTAINER":
				return "Manutentore";
			case "STUDENT":
				return "Studente";
			default:
				return "Ruolo Sconosciuto";
		}
	};

	return (
		<div className={cn("relative", className)}>
			{/* Edit mode indicator */}
			<div className="fixed right-4 top-4 z-50 flex items-center gap-2">
				<Badge className={cn("text-xs font-medium", getRoleColor(userRole))}>
					{getRoleLabel(userRole)}
				</Badge>
				<Badge className="bg-primary text-primary-foreground">
					Modalità Modifica Attiva
				</Badge>
			</div>

			{/* Warning alert */}
			<div className="mb-6">
				<Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
					<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
					<AlertDescription className="text-amber-800 dark:text-amber-200">
						<strong>Modalità Modifica Attiva:</strong> Puoi ora modificare, aggiungere
						ed eliminare contenuti. Le modifiche saranno immediatamente visibili a tutti
						gli utenti.
					</AlertDescription>
				</Alert>
			</div>

			{/* Content with edit mode styling */}
			<div className="relative">
				{children}

				{/* Edit mode overlay effect */}
				<div className="pointer-events-none absolute inset-0 rounded-lg bg-primary/5" />
			</div>

			{/* Help text */}
			<div className="mt-6">
				<Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
					<Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
					<AlertDescription className="text-blue-800 dark:text-blue-200">
						<strong>Suggerimento:</strong> Passa il mouse sopra gli elementi per vedere
						le opzioni di modifica disponibili.
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}
