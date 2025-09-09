"use client";

import { ReactNode, createContext, useContext } from "react";

import { useSession } from "next-auth/react";

import { useUserSectionsAccess } from "@/hooks/useUserData";

interface SectionAccessContextType {
	userAccessibleSections: string[];
	isLoading: boolean;
	canAccessSection: (sectionId: string, isPublic: boolean) => boolean;
}

const SectionAccessContext = createContext<SectionAccessContextType | undefined>(
	undefined
);

interface SectionAccessProviderProps {
	children: ReactNode;
	classId: string;
}

export function SectionAccessProvider({
	children,
	classId,
}: SectionAccessProviderProps) {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data: accessibleSections, isLoading } = useUserSectionsAccess(
		userId || "",
		classId
	);

	const userAccessibleSections = accessibleSections?.map(section => section.id) || [];

	const canAccessSection = (sectionId: string, isPublic: boolean): boolean => {
		if (isPublic) {
			return true;
		}

		if (!userId) {
			return false;
		}

		return userAccessibleSections.includes(sectionId);
	};

	return (
		<SectionAccessContext.Provider
			value={{
				userAccessibleSections,
				isLoading,
				canAccessSection,
			}}
		>
			{children}
		</SectionAccessContext.Provider>
	);
}

export function useSectionAccess() {
	const context = useContext(SectionAccessContext);
	if (context === undefined) {
		throw new Error("useSectionAccess must be used within a SectionAccessProvider");
	}
	return context;
}
