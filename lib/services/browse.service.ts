import { prisma } from '../prisma';
import type {
    BrowseTreeResponse,
    DepartmentNode,
    ClassNode,
    SectionNode,
    ExpandCourseResponse,
    ExpandClassResponse
} from '../types/browse.types';

export class BrowseService {
    /**
     * Ottieni la struttura iniziale: Departments → Courses
     * Le classi e sezioni vengono caricate on-demand
     */
    static async getInitialTree(): Promise<BrowseTreeResponse> {
        const departments = await prisma.department.findMany({
            orderBy: { position: 'asc' },
            include: {
                courses: {
                    orderBy: { position: 'asc' },
                    include: {
                        _count: {
                            select: { classes: true }
                        }
                    }
                },
                _count: {
                    select: { courses: true }
                }
            }
        });

        const departmentNodes: DepartmentNode[] = departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            code: dept.code,
            description: dept.description ?? undefined,
            position: dept.position,
            _count: {
                courses: dept._count.courses
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
                    classes: course._count.classes
                }
            }))
        }));

        return { departments: departmentNodes };
    }

    /**
     * Espandi un corso per mostrare le sue classi
     */
    static async expandCourse(courseId: string): Promise<ExpandCourseResponse> {
        const classes = await prisma.class.findMany({
            where: { courseId },
            orderBy: { position: 'asc' },
            include: {
                _count: {
                    select: {
                        sections: {
                            where: { isPublic: true } // Solo sezioni pubbliche per utenti non autenticati
                        }
                    }
                }
            }
        });

        const classNodes: ClassNode[] = classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            code: cls.code,
            description: cls.description ?? undefined,
            classYear: cls.classYear,
            position: cls.position,
            courseId: cls.courseId,
            _count: {
                sections: cls._count.sections
            }
        }));

        return { classes: classNodes };
    }

    /**
     * Espandi una classe per mostrare le sue sezioni
     */
    static async expandClass(classId: string, userId?: string): Promise<ExpandClassResponse> {
        // Se l'utente è autenticato, mostra anche sezioni private con accesso
        const whereClause = userId
            ? {
                classId,
                OR: [
                    { isPublic: true },
                    {
                        access: {
                            some: { userId }
                        }
                    }
                ]
            }
            : {
                classId,
                isPublic: true
            };

        const sections = await prisma.section.findMany({
            where: whereClause,
            orderBy: { position: 'asc' },
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        });

        const sectionNodes: SectionNode[] = sections.map(section => ({
            id: section.id,
            name: section.name,
            description: section.description ?? undefined,
            isPublic: section.isPublic,
            position: section.position,
            classId: section.classId,
            _count: {
                questions: section._count.questions
            }
        }));

        return { sections: sectionNodes };
    }

    /**
     * Cerca nella struttura (opzionale per implementazioni future)
     */
    static async searchTree(query: string, limit: number = 50) {
        const searchResults = await prisma.$transaction([
            // Cerca dipartimenti
            prisma.department.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { code: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: Math.floor(limit * 0.2)
            }),

            // Cerca corsi
            prisma.course.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { code: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }
                    ]
                },
                include: { department: true },
                take: Math.floor(limit * 0.3)
            }),

            // Cerca classi
            prisma.class.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { code: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }
                    ]
                },
                include: {
                    course: {
                        include: { department: true }
                    }
                },
                take: Math.floor(limit * 0.3)
            }),

            // Cerca sezioni pubbliche
            prisma.section.findMany({
                where: {
                    isPublic: true,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }
                    ]
                },
                include: {
                    class: {
                        include: {
                            course: {
                                include: { department: true }
                            }
                        }
                    }
                },
                take: Math.floor(limit * 0.2)
            })
        ]);

        return {
            departments: searchResults[0],
            courses: searchResults[1],
            classes: searchResults[2],
            sections: searchResults[3]
        };
    }
}
