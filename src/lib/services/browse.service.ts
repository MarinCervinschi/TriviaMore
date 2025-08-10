import { prisma } from "@/lib/prisma";

import type {
	BrowseTreeResponse,
	ClassNode,
	DepartmentNode,
	ExpandClassResponse,
	ExpandCourseResponse,
	SectionNode,
} from "../types/browse.types";
import { type UserPermissions, UserService } from "./user.service";

export class BrowseService extends UserService {
	/**
	 * Ottieni la struttura iniziale: solo Departments con count dei corsi
	 * Ottimizzato per la pagina browse principale
	 */
	static async getInitialTree(): Promise<BrowseTreeResponse> {
		const departments = await prisma.department.findMany({
			orderBy: { position: "asc" },
			include: {
				_count: {
					select: { courses: true },
				},
			},
		});

		const departmentNodes: DepartmentNode[] = departments.map(dept => ({
			id: dept.id,
			name: dept.name,
			code: dept.code,
			description: dept.description ?? undefined,
			position: dept.position,
			_count: {
				courses: dept._count.courses,
			},
		}));

		return { departments: departmentNodes };
	}

	/**
	 * Cerca nella struttura (opzionale per implementazioni future)
	 */
	static async searchTree(query: string, limit: number = 50, userId?: string) {
		let permissions: UserPermissions | undefined;

		if (userId) {
			permissions = await super.getUserPermissions(userId);
		}

		// Base delle sezioni - solo pubbliche per default
		let sectionSearchWhere: any = {
			isPublic: true,
			OR: [
				{ name: { contains: query, mode: "insensitive" } },
				{ description: { contains: query, mode: "insensitive" } },
			],
		};

		// Se l'utente è autenticato, espandi i criteri di ricerca per le sezioni
		if (permissions) {
			if (permissions.role === "SUPERADMIN") {
				// SUPERADMIN vede tutto
				sectionSearchWhere = {
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
				};
			} else if (permissions.role === "ADMIN") {
				// ADMIN vede tutto dei propri dipartimenti
				sectionSearchWhere = {
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
					AND: [
						{
							OR: [
								{ isPublic: true },
								{ id: { in: permissions.accessibleSectionIds } },
								{
									class: {
										course: {
											departmentId: {
												in: permissions.managedDepartmentIds,
											},
										},
									},
								},
							],
						},
					],
				};
			} else if (permissions.role === "MAINTAINER") {
				// MAINTAINER vede tutto dei propri corsi
				sectionSearchWhere = {
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
					AND: [
						{
							OR: [
								{ isPublic: true },
								{ id: { in: permissions.accessibleSectionIds } },
								{
									class: {
										courseId: {
											in: permissions.maintainedCourseIds,
										},
									},
								},
							],
						},
					],
				};
			} else {
				// STUDENT: pubbliche + quelle a cui hanno accesso
				sectionSearchWhere = {
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
					AND: [
						{
							OR: [
								{ isPublic: true },
								{ id: { in: permissions.accessibleSectionIds } },
							],
						},
					],
				};
			}
		}

		const searchResults = await prisma.$transaction([
			// Cerca dipartimenti
			prisma.department.findMany({
				where: {
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ code: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
				},
				take: Math.floor(limit * 0.2),
			}),

			// Cerca corsi
			prisma.course.findMany({
				where: {
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ code: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
				},
				include: { department: true },
				take: Math.floor(limit * 0.3),
			}),

			// Cerca classi
			prisma.class.findMany({
				where: {
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ code: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
				},
				include: {
					course: {
						include: { department: true },
					},
				},
				take: Math.floor(limit * 0.3),
			}),

			// Cerca sezioni con permessi
			prisma.section.findMany({
				where: sectionSearchWhere,
				include: {
					class: {
						include: {
							course: {
								include: { department: true },
							},
						},
					},
				},
				take: Math.floor(limit * 0.2),
			}),
		]);

		return {
			departments: searchResults[0],
			courses: searchResults[1],
			classes: searchResults[2],
			sections: searchResults[3],
		};
	}

	/**
	 * Ottieni tutti i dipartimenti (per generateStaticParams)
	 */
	static async getAllDepartments() {
		return await prisma.department.findMany({
			select: {
				id: true,
				code: true,
				name: true,
			},
			orderBy: { position: "asc" },
		});
	}

	/**
	 * Ottieni un dipartimento per codice
	 */
	static async getDepartmentByCode(code: string) {
		return await prisma.department.findUnique({
			where: { code },
			select: {
				id: true,
				name: true,
				code: true,
				description: true,
			},
		});
	}

	/**
	 * Ottieni dipartimento con i suoi corsi e filtri
	 */
	static async getDepartmentWithCourses(
		departmentCode: string,
		filters: {
			courseType?: "BACHELOR" | "MASTER";
			search?: string;
		} = {},
		userId?: string
	) {
		let permissions: UserPermissions | undefined;

		if (userId) {
			permissions = await super.getUserPermissions(userId);
		}

		const department = await prisma.department.findUnique({
			where: { code: departmentCode },
			include: {
				courses: {
					where: {
						...(filters.courseType && { courseType: filters.courseType }),
						...(filters.search && {
							OR: [
								{ name: { contains: filters.search, mode: "insensitive" } },
								{ code: { contains: filters.search, mode: "insensitive" } },
								{ description: { contains: filters.search, mode: "insensitive" } },
							],
						}),
					},
					orderBy: { position: "asc" },
					include: {
						_count: {
							select: { classes: true },
						},
					},
				},
				_count: {
					select: { courses: true },
				},
			},
		});

		if (!department) {
			return null;
		}

		return {
			id: department.id,
			name: department.name,
			code: department.code,
			description: department.description,
			position: department.position,
			_count: {
				courses: department._count.courses,
			},
			courses: department.courses.map(course => ({
				id: course.id,
				name: course.name,
				code: course.code,
				description: course.description,
				courseType: course.courseType,
				position: course.position,
				departmentId: course.departmentId,
				_count: {
					classes: course._count.classes,
				},
			})),
		};
	}
}
