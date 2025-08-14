"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

interface EditModeContextType {
	isEditMode: boolean;
	toggleEditMode: () => void;
	setEditMode: (active: boolean) => void;
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

	const toggleEditMode = () => {
		setIsEditMode(prev => !prev);
	};

	const setEditMode = (active: boolean) => {
		setIsEditMode(active);
	};

	return (
		<EditModeContext.Provider value={{ isEditMode, toggleEditMode, setEditMode }}>
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
