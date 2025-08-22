"use client";

import { useState } from "react";

import { useSession } from "next-auth/react";

import { EditModeButton } from "@/components/EditMode/edit-mode-button";
import { EditModeOverlay } from "@/components/EditMode/edit-mode-overlay";
import { RebuildButton } from "@/components/EditMode/rebuild-button";
import { CrudModal, Modal } from "@/components/modals/CrudModal";
import type { DepartmentNode } from "@/lib/types/browse.types";
import { useEditModeContext } from "@/providers/edit-mode-provider";

import { BrowseHero } from "./BrowseHero";
import { BrowseStats } from "./BrowseStats";
import { DepartmentGrid } from "./DepartmentGrid";

interface BrowsePageComponentProps {
	departments?: DepartmentNode[];
}

export default function BrowsePageComponent({ departments }: BrowsePageComponentProps) {
	const { data: session } = useSession();
	const { isEditMode, toggleEditMode, buildApp, isLoading } = useEditModeContext();
	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "department",
	});
	const canEdit = session?.user?.role === "SUPERADMIN";

	const totalCourses =
		departments?.reduce((total, dept) => total + (dept._count?.courses || 0), 0) || 0;

	const handleEditAction = (action: "create", type: "department", data?: any) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	return (
		<EditModeOverlay isActive={isEditMode}>
			<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					{canEdit && (
						<div className="mb-6 flex justify-end">
							<div className="flex items-center gap-2">
								<EditModeButton isActive={isEditMode} onToggle={toggleEditMode} />
								<RebuildButton isLoading={isLoading} onClick={buildApp} />
							</div>
						</div>
					)}

					<BrowseHero
						title="Esplora i Contenuti"
						description="Scopri tutti i dipartimenti e i corsi disponibili. Naviga attraverso la struttura accademica per trovare i contenuti che ti interessano."
					/>

					<BrowseStats
						departmentCount={departments?.length || 0}
						totalCourses={totalCourses}
					/>

					{isEditMode && canEdit && (
						<div className="mb-6">
							<button
								onClick={() => handleEditAction("create", "department")}
								className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								<span>+</span>
								Crea Nuovo Dipartimento
							</button>
						</div>
					)}

					<DepartmentGrid departments={departments} />

					<CrudModal
						isOpen={modalState.isOpen}
						onClose={() => setModalState({ ...modalState, isOpen: false })}
						mode={modalState.mode}
						type={modalState.type}
						initialData={modalState.data}
					/>
				</div>
			</div>
		</EditModeOverlay>
	);
}
