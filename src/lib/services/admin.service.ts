import { prisma } from "@/lib/prisma";

import {
	ClassBody,
	CourseBody,
	DepartmentBody,
	QuestionBody,
	SectionBody,
} from "../types/crud.types";
import { type UserPermissions, UserService } from "./user.service";

export class AdminService extends UserService {
	/**
	 * Check if user has permission to perform admin operations
	 */
	private static async checkAdminPermissions(
		userId: string,
		operation: "department" | "course" | "class" | "section" | "question",
		resourceId?: string
	): Promise<{ hasPermission: boolean; permissions: UserPermissions }> {
		const permissions = await super.getUserPermissions(userId);

		// SUPERADMIN can do everything
		if (permissions.role === "SUPERADMIN") {
			return { hasPermission: true, permissions };
		}

		// STUDENT cannot do anything
		if (permissions.role === "STUDENT") {
			return { hasPermission: false, permissions };
		}

		// ADMIN can manage their departments
		if (permissions.role === "ADMIN") {
			if (operation === "department") {
				// For department operations, check if they manage this department
				if (resourceId && !permissions.managedDepartmentIds.includes(resourceId)) {
					return { hasPermission: false, permissions };
				}
				return { hasPermission: true, permissions };
			}

			// For other operations, check if the resource belongs to their managed departments
			if (resourceId) {
				const belongsToManagedDepartment =
					await this.checkResourceBelongsToManagedDepartment(
						resourceId,
						operation,
						permissions.managedDepartmentIds
					);
				return { hasPermission: belongsToManagedDepartment, permissions };
			}

			return { hasPermission: true, permissions };
		}

		// MAINTAINER can only manage classes, sections, and questions in their courses
		if (permissions.role === "MAINTAINER") {
			if (operation === "department" || operation === "course") {
				return { hasPermission: false, permissions };
			}

			if (resourceId) {
				const belongsToMaintainedCourse =
					await this.checkResourceBelongsToMaintainedCourse(
						resourceId,
						operation,
						permissions.maintainedCourseIds
					);
				return { hasPermission: belongsToMaintainedCourse, permissions };
			}

			return { hasPermission: true, permissions };
		}

		return { hasPermission: false, permissions };
	}

	/**
	 * Check if a resource belongs to a managed department
	 */
	private static async checkResourceBelongsToManagedDepartment(
		resourceId: string,
		operation: "course" | "class" | "section" | "question",
		managedDepartmentIds: string[]
	): Promise<boolean> {
		switch (operation) {
			case "course": {
				const course = await prisma.course.findUnique({
					where: { id: resourceId },
					select: { departmentId: true },
				});
				return course ? managedDepartmentIds.includes(course.departmentId) : false;
			}

			case "class": {
				const classData = await prisma.class.findUnique({
					where: { id: resourceId },
					include: { course: { select: { departmentId: true } } },
				});
				return classData
					? managedDepartmentIds.includes(classData.course.departmentId)
					: false;
			}

			case "section": {
				const section = await prisma.section.findUnique({
					where: { id: resourceId },
					include: {
						class: { include: { course: { select: { departmentId: true } } } },
					},
				});
				return section
					? managedDepartmentIds.includes(section.class.course.departmentId)
					: false;
			}

			case "question": {
				const question = await prisma.question.findUnique({
					where: { id: resourceId },
					include: {
						section: {
							include: {
								class: { include: { course: { select: { departmentId: true } } } },
							},
						},
					},
				});
				return question
					? managedDepartmentIds.includes(question.section.class.course.departmentId)
					: false;
			}

			default:
				return false;
		}
	}

	/**
	 * Check if a resource belongs to a maintained course
	 */
	private static async checkResourceBelongsToMaintainedCourse(
		resourceId: string,
		operation: "class" | "section" | "question",
		maintainedCourseIds: string[]
	): Promise<boolean> {
		switch (operation) {
			case "class": {
				const classData = await prisma.class.findUnique({
					where: { id: resourceId },
					select: { courseId: true },
				});
				return classData ? maintainedCourseIds.includes(classData.courseId) : false;
			}

			case "section": {
				const section = await prisma.section.findUnique({
					where: { id: resourceId },
					include: { class: { select: { courseId: true } } },
				});
				return section ? maintainedCourseIds.includes(section.class.courseId) : false;
			}

			case "question": {
				const question = await prisma.question.findUnique({
					where: { id: resourceId },
					include: { section: { include: { class: { select: { courseId: true } } } } },
				});
				return question
					? maintainedCourseIds.includes(question.section.class.courseId)
					: false;
			}

			default:
				return false;
		}
	}

	// Department CRUD operations
	static async createDepartment(userId: string, data: DepartmentBody) {
		const { hasPermission } = await this.checkAdminPermissions(userId, "department");
		if (!hasPermission) {
			throw new Error("Non hai i permessi per creare dipartimenti");
		}

		// Check if department code already exists
		const existingDepartment = await prisma.department.findUnique({
			where: { code: data.code },
		});

		if (existingDepartment) {
			throw new Error("Un dipartimento con questo codice esiste già");
		}

		return await prisma.department.create({
			data: {
				name: data.name,
				code: data.code.toUpperCase(),
				description: data.description,
				position: data.position ?? 0,
			},
		});
	}

	static async updateDepartment(
		userId: string,
		departmentId: string,
		data: DepartmentBody
	) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"department",
			departmentId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per modificare questo dipartimento");
		}

		// Check if new code conflicts with existing department
		if (data.code) {
			const existingDepartment = await prisma.department.findFirst({
				where: {
					code: data.code.toUpperCase(),
					NOT: { id: departmentId },
				},
			});

			if (existingDepartment) {
				throw new Error("Un dipartimento con questo codice esiste già");
			}
		}

		return await prisma.department.update({
			where: { id: departmentId },
			data: {
				...(data.name && { name: data.name }),
				...(data.code && { code: data.code.toUpperCase() }),
				...(data.description !== undefined && { description: data.description }),
				...(data.position !== undefined && { position: data.position }),
			},
		});
	}

	static async deleteDepartment(userId: string, departmentId: string) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"department",
			departmentId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per eliminare questo dipartimento");
		}

		// Check if department has courses
		const coursesCount = await prisma.course.count({
			where: { departmentId },
		});

		if (coursesCount > 0) {
			throw new Error("Non puoi eliminare un dipartimento che contiene corsi");
		}

		return await prisma.department.delete({
			where: { id: departmentId },
		});
	}

	// Course CRUD operations
	static async createCourse(userId: string, data: CourseBody) {
		const { hasPermission } = await this.checkAdminPermissions(userId, "course");
		if (!hasPermission) {
			throw new Error("Non hai i permessi per creare corsi");
		}

		// Check if course code already exists in the department
		const existingCourse = await prisma.course.findFirst({
			where: {
				code: data.code.toUpperCase(),
				departmentId: data.departmentId,
			},
		});

		if (existingCourse) {
			throw new Error("Un corso con questo codice esiste già in questo dipartimento");
		}

		return await prisma.course.create({
			data: {
				name: data.name,
				code: data.code.toUpperCase(),
				description: data.description,
				departmentId: data.departmentId,
				courseType: data.courseType,
				position: data.position ?? 0,
			},
		});
	}

	static async updateCourse(userId: string, courseId: string, data: CourseBody) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"course",
			courseId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per modificare questo corso");
		}

		// Check if new code conflicts with existing course in the same department
		if (data.code) {
			const course = await prisma.course.findUnique({
				where: { id: courseId },
				select: { departmentId: true },
			});

			if (course) {
				const existingCourse = await prisma.course.findFirst({
					where: {
						code: data.code.toUpperCase(),
						departmentId: course.departmentId,
						NOT: { id: courseId },
					},
				});

				if (existingCourse) {
					throw new Error(
						"Un corso con questo codice esiste già in questo dipartimento"
					);
				}
			}
		}

		return await prisma.course.update({
			where: { id: courseId },
			data: {
				...(data.name && { name: data.name }),
				...(data.code && { code: data.code.toUpperCase() }),
				...(data.description !== undefined && { description: data.description }),
				...(data.courseType && { courseType: data.courseType }),
				...(data.position !== undefined && { position: data.position }),
			},
		});
	}

	static async deleteCourse(userId: string, courseId: string) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"course",
			courseId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per eliminare questo corso");
		}

		// Check if course has classes
		const classesCount = await prisma.class.count({
			where: { courseId },
		});

		if (classesCount > 0) {
			throw new Error("Non puoi eliminare un corso che contiene classi");
		}

		return await prisma.course.delete({
			where: { id: courseId },
		});
	}

	// Class CRUD operations
	static async createClass(userId: string, data: ClassBody) {
		const { hasPermission } = await this.checkAdminPermissions(userId, "class");
		if (!hasPermission) {
			throw new Error("Non hai i permessi per creare classi");
		}

		// Check if class code already exists in the course
		const existingClass = await prisma.class.findFirst({
			where: {
				code: data.code.toUpperCase(),
				courseId: data.courseId,
			},
		});

		if (existingClass) {
			throw new Error("Una classe con questo codice esiste già in questo corso");
		}

		return await prisma.class.create({
			data: {
				name: data.name,
				code: data.code.toUpperCase(),
				description: data.description,
				courseId: data.courseId,
				classYear: data.classYear,
				position: data.position ?? 0,
			},
		});
	}

	static async updateClass(userId: string, classId: string, data: ClassBody) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"class",
			classId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per modificare questa classe");
		}

		// Check if new code conflicts with existing class in the same course
		if (data.code) {
			const classData = await prisma.class.findUnique({
				where: { id: classId },
				select: { courseId: true },
			});

			if (classData) {
				const existingClass = await prisma.class.findFirst({
					where: {
						code: data.code.toUpperCase(),
						courseId: classData.courseId,
						NOT: { id: classId },
					},
				});

				if (existingClass) {
					throw new Error("Una classe con questo codice esiste già in questo corso");
				}
			}
		}

		return await prisma.class.update({
			where: { id: classId },
			data: {
				...(data.name && { name: data.name }),
				...(data.code && { code: data.code.toUpperCase() }),
				...(data.description !== undefined && { description: data.description }),
				...(data.classYear && { classYear: data.classYear }),
				...(data.position !== undefined && { position: data.position }),
			},
		});
	}

	static async deleteClass(userId: string, classId: string) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"class",
			classId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per eliminare questa classe");
		}

		// Check if class has sections
		const sectionsCount = await prisma.section.count({
			where: { classId },
		});

		if (sectionsCount > 0) {
			throw new Error("Non puoi eliminare una classe che contiene sezioni");
		}

		return await prisma.class.delete({
			where: { id: classId },
		});
	}

	// Section CRUD operations
	static async createSection(userId: string, data: SectionBody) {
		const { hasPermission } = await this.checkAdminPermissions(userId, "section");
		if (!hasPermission) {
			throw new Error("Non hai i permessi per creare sezioni");
		}

		return await prisma.section.create({
			data: {
				name: data.name,
				description: data.description,
				classId: data.classId,
				isPublic: data.isPublic ?? true,
				position: data.position ?? 0,
			},
		});
	}

	static async updateSection(userId: string, sectionId: string, data: SectionBody) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"section",
			sectionId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per modificare questa sezione");
		}

		return await prisma.section.update({
			where: { id: sectionId },
			data: {
				...(data.name && { name: data.name }),
				...(data.description !== undefined && { description: data.description }),
				...(data.isPublic !== undefined && { isPublic: data.isPublic }),
				...(data.position !== undefined && { position: data.position }),
			},
		});
	}

	static async deleteSection(userId: string, sectionId: string) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"section",
			sectionId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per eliminare questa sezione");
		}

		// Check if section has questions
		const questionsCount = await prisma.question.count({
			where: { sectionId },
		});

		if (questionsCount > 0) {
			throw new Error("Non puoi eliminare una sezione che contiene domande");
		}

		return await prisma.section.delete({
			where: { id: sectionId },
		});
	}

	// Question CRUD operations
	static async getQuestionsBySectionId(sectionId: string) {
		if (!sectionId) {
			throw new Error("Section ID not provided");
		}

		return await prisma.question.findMany({
			where: { sectionId },
		});
	}

	static async createQuestion(userId: string, data: QuestionBody) {
		const { hasPermission } = await this.checkAdminPermissions(userId, "question");
		if (!hasPermission) {
			throw new Error("Non hai i permessi per creare domande");
		}

		return await prisma.question.create({
			data: {
				content: data.content,
				questionType: data.questionType,
				options: data.options,
				correctAnswer: data.correctAnswer,
				explanation: data.explanation,
				difficulty: data.difficulty,
				sectionId: data.sectionId,
			},
		});
	}

	static async createQuestions(userId: string, questions: QuestionBody[]) {
		const { hasPermission } = await this.checkAdminPermissions(userId, "question");
		if (!hasPermission) {
			throw new Error("Non hai i permessi per creare domande");
		}

		return await prisma.question.createMany({
			data: questions.map(data => ({
				content: data.content,
				questionType: data.questionType,
				options: data.options,
				correctAnswer: data.correctAnswer,
				explanation: data.explanation,
				difficulty: data.difficulty,
				sectionId: data.sectionId,
			})),
		});
	}

	static async updateQuestion(userId: string, questionId: string, data: QuestionBody) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"question",
			questionId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per modificare questa domanda");
		}

		return await prisma.question.update({
			where: { id: questionId },
			data: {
				...(data.content && { content: data.content }),
				...(data.questionType && { questionType: data.questionType }),
				...(data.options !== undefined && { options: data.options }),
				...(data.correctAnswer && { correctAnswer: data.correctAnswer }),
				...(data.explanation !== undefined && { explanation: data.explanation }),
				...(data.difficulty && { difficulty: data.difficulty }),
			},
		});
	}

	static async deleteQuestion(userId: string, questionId: string) {
		const { hasPermission } = await this.checkAdminPermissions(
			userId,
			"question",
			questionId
		);
		if (!hasPermission) {
			throw new Error("Non hai i permessi per eliminare questa domanda");
		}

		return await prisma.question.delete({
			where: { id: questionId },
		});
	}
}
