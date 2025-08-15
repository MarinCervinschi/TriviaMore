"use client";

import { useMemo } from "react";

import type { Role, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface EditModePermissions {
	canEdit: boolean;
	canEditDepartments: boolean;
	canEditCourses: boolean;
	canEditClasses: boolean;
	canEditSections: boolean;
	canEditQuestions: boolean;
	role: Role | null;
}

interface UserPermissions {
	managedDepartmentIds: string[];
	maintainedCourseIds: string[];
}

interface UseEditModeProps {
	departmentId?: string;
	courseId?: string;
	classId?: string;
}

async function fetchUserPermissions(): Promise<UserPermissions> {
	const response = await fetch("/api/user/permissions");
	if (!response.ok) {
		throw new Error("Failed to fetch user permissions");
	}
	return response.json();
}

function calculateEditPermissions({
	user,
	departmentId,
	courseId,
	classId,
	managedDepartmentIds = [],
	maintainedCourseIds = [],
}: {
	user?: User | null;
	departmentId?: string;
	courseId?: string;
	classId?: string;
	managedDepartmentIds?: string[];
	maintainedCourseIds?: string[];
}): EditModePermissions {
	if (!user || !user.role) {
		return {
			canEdit: false,
			canEditDepartments: false,
			canEditCourses: false,
			canEditClasses: false,
			canEditSections: false,
			canEditQuestions: false,
			role: null,
		};
	}

	const role = user.role as Role;

	// STUDENT: no edit permissions
	if (role === "STUDENT") {
		return {
			canEdit: false,
			canEditDepartments: false,
			canEditCourses: false,
			canEditClasses: false,
			canEditSections: false,
			canEditQuestions: false,
			role,
		};
	}

	// SUPERADMIN: full permissions everywhere
	if (role === "SUPERADMIN") {
		return {
			canEdit: true,
			canEditDepartments: true,
			canEditCourses: true,
			canEditClasses: true,
			canEditSections: true,
			canEditQuestions: true,
			role,
		};
	}

	// ADMIN: can edit within their managed departments
	if (role === "ADMIN") {
		const canEditInDepartment = departmentId
			? managedDepartmentIds.includes(departmentId)
			: managedDepartmentIds.length > 0;

		return {
			canEdit: canEditInDepartment,
			canEditDepartments: canEditInDepartment,
			canEditCourses: canEditInDepartment,
			canEditClasses: canEditInDepartment,
			canEditSections: canEditInDepartment,
			canEditQuestions: canEditInDepartment,
			role,
		};
	}

	// MAINTAINER: can edit within their maintained courses (only at class level and below)
	if (role === "MAINTAINER") {
		const canEditInCourse = courseId
			? maintainedCourseIds.includes(courseId)
			: maintainedCourseIds.length > 0;

		return {
			canEdit: canEditInCourse && !!classId, // Only show edit mode in class pages and below
			canEditDepartments: false,
			canEditCourses: false,
			canEditClasses: canEditInCourse,
			canEditSections: canEditInCourse,
			canEditQuestions: canEditInCourse,
			role,
		};
	}

	return {
		canEdit: false,
		canEditDepartments: false,
		canEditCourses: false,
		canEditClasses: false,
		canEditSections: false,
		canEditQuestions: false,
		role,
	};
}

export function useEditMode({
	departmentId,
	courseId,
	classId,
}: UseEditModeProps = {}): EditModePermissions {
	const { data: session } = useSession();

	const shouldFetchPermissions =
		session?.user?.role && ["ADMIN", "MAINTAINER"].includes(session.user.role);

	const { data: userPermissions, isLoading } = useQuery({
		queryKey: ["userPermissions", session?.user?.id],
		queryFn: fetchUserPermissions,
		enabled: shouldFetchPermissions,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	const permissions = useMemo(() => {
		if (shouldFetchPermissions && isLoading) {
			return {
				canEdit: false,
				canEditDepartments: false,
				canEditCourses: false,
				canEditClasses: false,
				canEditSections: false,
				canEditQuestions: false,
				role: (session?.user?.role as Role) || null,
			};
		}

		return calculateEditPermissions({
			user: session?.user,
			departmentId,
			courseId,
			classId,
			managedDepartmentIds: userPermissions?.managedDepartmentIds || [],
			maintainedCourseIds: userPermissions?.maintainedCourseIds || [],
		});
	}, [
		session?.user,
		departmentId,
		courseId,
		classId,
		userPermissions?.managedDepartmentIds,
		userPermissions?.maintainedCourseIds,
		isLoading,
		shouldFetchPermissions,
	]);

	return permissions;
}
