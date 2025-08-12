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

		// Base delle sezioni - solo pubbliche per default, escludendo Exam Simulation
		let sectionSearchWhere: any = {
			isPublic: true,
			name: { not: "Exam Simulation" },
			OR: [
				{ name: { contains: query, mode: "insensitive" } },
				{ description: { contains: query, mode: "insensitive" } },
			],
		};

		// Se l'utente è autenticato, espandi i criteri di ricerca per le sezioni
		if (permissions) {
			if (permissions.role === "SUPERADMIN") {
				// SUPERADMIN vede tutto ma esclude Exam Simulation
				sectionSearchWhere = {
					name: { not: "Exam Simulation" },
					OR: [
						{ name: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
				};
			} else if (permissions.role === "ADMIN") {
				// ADMIN vede tutto dei propri dipartimenti ma esclude Exam Simulation
				sectionSearchWhere = {
					name: { not: "Exam Simulation" },
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
				// MAINTAINER vede tutto dei propri corsi ma esclude Exam Simulation
				sectionSearchWhere = {
					name: { not: "Exam Simulation" },
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
				// STUDENT: pubbliche + quelle a cui hanno accesso ma esclude Exam Simulation
				sectionSearchWhere = {
					name: { not: "Exam Simulation" },
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

	/**
	 * Ottieni tutti i corsi di un dipartimento (per generateStaticParams)
	 */
	static async getCoursesByDepartment(departmentCode: string) {
		const department = await prisma.department.findUnique({
			where: { code: departmentCode },
			include: {
				courses: {
					select: {
						id: true,
						code: true,
						name: true,
					},
					orderBy: { position: "asc" },
				},
			},
		});

		return department?.courses || [];
	}

	/**
	 * Ottieni un corso per codice
	 */
	static async getCourseByCode(departmentCode: string, courseCode: string) {
		return await prisma.course.findFirst({
			where: {
				code: courseCode,
				department: { code: departmentCode },
			},
			include: {
				department: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
			},
		});
	}

	/**
	 * Ottieni corso con le sue classi e filtri
	 */
	static async getCourseWithClasses(
		departmentCode: string,
		courseCode: string,
		filters: {
			classYear?: number;
			search?: string;
		} = {},
		userId?: string
	) {
		let permissions: UserPermissions | undefined;

		if (userId) {
			permissions = await super.getUserPermissions(userId);
		}

		const course = await prisma.course.findFirst({
			where: {
				code: courseCode,
				department: { code: departmentCode },
			},
			include: {
				department: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
				classes: {
					where: {
						...(filters.classYear && { classYear: filters.classYear }),
						...(filters.search && {
							OR: [
								{ name: { contains: filters.search, mode: "insensitive" } },
								{ code: { contains: filters.search, mode: "insensitive" } },
								{ description: { contains: filters.search, mode: "insensitive" } },
							],
						}),
					},
					orderBy: [{ classYear: "asc" }, { position: "asc" }],
					include: {
						sections: {
							select: {
								id: true,
							},
						},
					},
				},
				_count: {
					select: { classes: true },
				},
			},
		});

		if (!course) {
			return null;
		}

		// Per ogni classe, conta solo le sezioni accessibili all'utente
		const classesWithAccessibleSections = await Promise.all(
			course.classes.map(async cls => {
				// Usa getSectionWhereClause per determinare quali sezioni l'utente può vedere
				const sectionWhereClause = await super.getSectionWhereClause(
					cls.id,
					permissions
				);

				// Conta le sezioni accessibili
				const accessibleSectionsCount = await prisma.section.count({
					where: sectionWhereClause,
				});

				return {
					id: cls.id,
					name: cls.name,
					code: cls.code,
					description: cls.description,
					courseId: cls.courseId,
					classYear: cls.classYear,
					position: cls.position,
					_count: {
						sections: accessibleSectionsCount,
					},
				};
			})
		);

		return {
			id: course.id,
			name: course.name,
			code: course.code,
			description: course.description,
			courseType: course.courseType,
			position: course.position,
			departmentId: course.departmentId,
			department: course.department,
			_count: {
				classes: course._count.classes,
			},
			classes: classesWithAccessibleSections,
		};
	}

	/**
	 * Ottieni tutte le classi di un corso (per generateStaticParams)
	 */
	static async getClassesByCourse(departmentCode: string, courseCode: string) {
		const course = await prisma.course.findFirst({
			where: {
				code: courseCode,
				department: { code: departmentCode },
			},
			include: {
				classes: {
					select: {
						id: true,
						code: true,
						name: true,
					},
					orderBy: [{ classYear: "asc" }, { position: "asc" }],
				},
			},
		});

		return course?.classes || [];
	}

	/**
	 * Ottieni una classe per codice
	 */
	static async getClassByCode(
		departmentCode: string,
		courseCode: string,
		classCode: string
	) {
		return await prisma.class.findFirst({
			where: {
				code: classCode,
				course: {
					code: courseCode,
					department: { code: departmentCode },
				},
			},
			include: {
				course: {
					include: {
						department: {
							select: {
								id: true,
								name: true,
								code: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Ottieni classe con le sue sezioni e filtri
	 */
	static async getClassWithSections(
		departmentCode: string,
		courseCode: string,
		classCode: string,
		filters: {
			search?: string;
		} = {},
		userId?: string
	) {
		let permissions: UserPermissions | undefined;

		if (userId) {
			permissions = await super.getUserPermissions(userId);
		}

		const classData = await prisma.class.findFirst({
			where: {
				code: classCode,
				course: {
					code: courseCode,
					department: { code: departmentCode },
				},
			},
			include: {
				course: {
					include: {
						department: {
							select: {
								id: true,
								name: true,
								code: true,
							},
						},
					},
				},
				_count: {
					select: { sections: true },
				},
			},
		});

		if (!classData) {
			return null;
		}

		// Ottieni le sezioni accessibili
		const sectionWhereClause = await super.getSectionWhereClause(
			classData.id,
			permissions
		);

		// Costruisci la query finale includendo il filtro di ricerca
		const whereClause = filters.search
			? {
					AND: [
						sectionWhereClause,
						{
							OR: [
								{ name: { contains: filters.search, mode: "insensitive" as const } },
								{
									description: {
										contains: filters.search,
										mode: "insensitive" as const,
									},
								},
							],
						},
					],
				}
			: sectionWhereClause;

		const sections = await prisma.section.findMany({
			where: whereClause,
			orderBy: { position: "asc" },
			include: {
				_count: {
					select: { questions: true },
				},
			},
		});

		return {
			id: classData.id,
			name: classData.name,
			code: classData.code,
			description: classData.description,
			courseId: classData.courseId,
			classYear: classData.classYear,
			position: classData.position,
			course: classData.course,
			_count: {
				sections: classData._count.sections,
			},
			sections: sections.map(section => ({
				id: section.id,
				name: section.name,
				description: section.description,
				isPublic: section.isPublic,
				position: section.position,
				classId: section.classId,
				_count: {
					questions: section._count.questions,
				},
			})),
		};
	}

	/**
	 * Ottieni tutte le sezioni di una classe (per generateStaticParams)
	 */
	static async getSectionsByClass(
		departmentCode: string,
		courseCode: string,
		classCode: string
	) {
		const classData = await prisma.class.findFirst({
			where: {
				code: classCode,
				course: {
					code: courseCode,
					department: { code: departmentCode },
				},
			},
			include: {
				sections: {
					select: {
						id: true,
						name: true,
					},
					orderBy: { position: "asc" },
				},
			},
		});

		return classData?.sections || [];
	}

	/**
	 * Ottieni una sezione per nome
	 */
	static async getSectionByName(
		departmentCode: string,
		courseCode: string,
		classCode: string,
		sectionName: string,
		userId?: string
	) {
		let permissions: UserPermissions | undefined;

		if (userId) {
			permissions = await super.getUserPermissions(userId);
		}

		// Converti il nome dalla URL (lowercase con trattini) al nome originale
		const originalSectionName = sectionName.replace(/-/g, " ");

		// Prima trova la classe
		const classData = await prisma.class.findFirst({
			where: {
				code: classCode,
				course: {
					code: courseCode,
					department: { code: departmentCode },
				},
			},
			include: {
				course: {
					include: {
						department: {
							select: {
								id: true,
								name: true,
								code: true,
							},
						},
					},
				},
			},
		});

		if (!classData) {
			return null;
		}

		// Ottieni il where clause per le sezioni
		const sectionWhereClause = await super.getSectionWhereClause(
			classData.id,
			permissions
		);

		// Cerca la sezione per nome (case insensitive)
		const section = await prisma.section.findFirst({
			where: {
				...sectionWhereClause,
				name: {
					equals: originalSectionName,
					mode: "insensitive" as const,
				},
			},
			include: {
				_count: {
					select: { questions: true },
				},
			},
		});

		if (!section) {
			return null;
		}

		return {
			id: section.id,
			name: section.name,
			description: section.description,
			isPublic: section.isPublic,
			position: section.position,
			classId: section.classId,
			class: classData,
			_count: {
				questions: section._count.questions,
			},
		};
	}
}
