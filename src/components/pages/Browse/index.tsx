"use client";

import { useState } from "react";

import { User } from "next-auth";

import { EditModeButton } from "@/components/EditMode/edit-mode-button";
import { EditModeOverlay } from "@/components/EditMode/edit-mode-overlay";
import { CrudModal, Modal } from "@/components/modals/CrudModal";
import { useEditMode } from "@/hooks/useEditMode";
import type { DepartmentNode } from "@/lib/types/browse.types";
import { useEditModeContext } from "@/providers/edit-mode-provider";

import { BrowseHero } from "./BrowseHero";
import { BrowseStats } from "./BrowseStats";
import { DepartmentGrid } from "./DepartmentGrid";

interface BrowsePageComponentProps {
	user: User | null;
	departments?: DepartmentNode[];
}

export default function BrowsePageComponent({
	user,
	departments,
}: BrowsePageComponentProps) {
	const { isEditMode, toggleEditMode } = useEditModeContext();
	const editPermissions = useEditMode();
	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "department",
	});

	const totalCourses =
		departments?.reduce((total, dept) => total + (dept._count?.courses || 0), 0) || 0;

	const handleEditAction = (action: "create", type: "department", data?: any) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	return (
		<EditModeOverlay isActive={isEditMode} userRole={user?.role || null}>
			<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="container mx-auto px-4 py-8">
					{editPermissions.canEdit && (
						<div className="mb-6 flex justify-end">
							<EditModeButton isActive={isEditMode} onToggle={toggleEditMode} />
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

					{isEditMode && editPermissions.canEditDepartments && (
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
