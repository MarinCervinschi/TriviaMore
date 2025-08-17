"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface EditModeContextType {
	isEditMode: boolean;
	toggleEditMode: () => void;
	setEditMode: (active: boolean) => void;
	buildApp: () => Promise<void>;
	isLoading: boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

interface EditModeProviderProps {
	children: ReactNode;
	defaultEditMode?: boolean;
}

export function EditModeProvider({
	children,
	defaultEditMode = false,
}: EditModeProviderProps) {
	const [isEditMode, setIsEditMode] = useState(defaultEditMode);

	const buildMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/protected/admin/rebuild", {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
		},
		onSuccess: () => {
			toast.success("Build succeeded");
		},
		onError: error => {
			console.error("Build failed:", error);
			toast.error("Build failed");
		},
	});

	const buildApp = async () => {
		buildMutation.mutateAsync();
	};

	const toggleEditMode = () => {
		setIsEditMode(prev => !prev);
	};

	const setEditMode = (active: boolean) => {
		setIsEditMode(active);
	};

	return (
		<EditModeContext.Provider
			value={{
				isEditMode,
				toggleEditMode,
				setEditMode,
				buildApp,
				isLoading: buildMutation.isPending,
			}}
		>
			{children}
		</EditModeContext.Provider>
	);
}

export function useEditModeContext() {
	const context = useContext(EditModeContext);
	if (context === undefined) {
		throw new Error("useEditModeContext must be used within an EditModeProvider");
	}
	return context;
}
