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
	 * Ottieni la struttura iniziale: Departments → Courses
	 * Le classi e sezioni vengono caricate on-demand
	 */
	static async getInitialTree(): Promise<BrowseTreeResponse> {
		const departments = await prisma.department.findMany({
			orderBy: { position: "asc" },
			include: {
				courses: {
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

		const departmentNodes: DepartmentNode[] = departments.map(dept => ({
			id: dept.id,
			name: dept.name,
			code: dept.code,
			description: dept.description ?? undefined,
			position: dept.position,
			_count: {
				courses: dept._count.courses,
			},
			courses: dept.courses.map(course => ({
				id: course.id,
				name: course.name,
				code: course.code,
				description: course.description ?? undefined,
				courseType: course.courseType,
				position: course.position,
				departmentId: course.departmentId,
				_count: {
					classes: course._count.classes,
				},
			})),
		}));

		return { departments: departmentNodes };
	}

	/**
	 * Espandi un corso per mostrare le sue classi
	 */
	static async expandCourse(
		courseId: string,
		userId?: string
	): Promise<ExpandCourseResponse> {
		let permissions: UserPermissions | undefined;

		if (userId) {
			permissions = await super.getUserPermissions(userId);
		}

		const classes = await prisma.class.findMany({
			where: { courseId },
			orderBy: { position: "asc" },
		});

		// Per ogni classe, contiamo le sezioni accessibili
		const classNodes: ClassNode[] = await Promise.all(
			classes.map(async cls => {
				const sectionWhereClause = await super.getSectionWhereClause(
					cls.id,
					permissions
				);

				const sectionCount = await prisma.section.count({
					where: sectionWhereClause,
				});

				return {
					id: cls.id,
					name: cls.name,
					code: cls.code,
					description: cls.description ?? undefined,
					classYear: cls.classYear,
					position: cls.position,
					courseId: cls.courseId,
					_count: {
						sections: sectionCount,
					},
				};
			})
		);

		return { classes: classNodes };
	}

	/**
	 * Espandi una classe per mostrare le sue sezioni
	 */
	static async expandClass(
		classId: string,
		userId?: string
	): Promise<ExpandClassResponse> {
		let permissions: UserPermissions | undefined;

		if (userId) {
			permissions = await super.getUserPermissions(userId);
		}

		const whereClause = await super.getSectionWhereClause(classId, permissions);

		console.log(
			"Fetching sections for classId:",
			classId,
			"with userId:",
			userId,
			"whereClause:",
			whereClause,
			"permissions:",
			permissions
		);

		const sections = await prisma.section.findMany({
			where: whereClause,
			orderBy: { position: "asc" },
			include: {
				_count: {
					select: { questions: true },
				},
			},
		});

		const sectionNodes: SectionNode[] = sections.map(section => ({
			id: section.id,
			name: section.name,
			description: section.description ?? undefined,
			isPublic: section.isPublic,
			position: section.position,
			classId: section.classId,
			_count: {
				questions: section._count.questions,
			},
		}));

		return { sections: sectionNodes };
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
}
