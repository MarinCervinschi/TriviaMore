
import { prisma } from '@/lib/prisma';
import type { UserClassResponse, RemoveClassFromUserListResponse } from '../types/user.types';

export interface UserPermissions {
    userId: string;
    role: 'SUPERADMIN' | 'ADMIN' | 'MAINTAINER' | 'STUDENT';
    managedDepartmentIds: string[];
    maintainedCourseIds: string[];
    accessibleSectionIds: string[];
}

export class UserService {
    /**
     * Ottieni i permessi dell'utente per la navigazione
     */
    protected static async getUserPermissions(userId: string): Promise<UserPermissions> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                managedDepartments: {
                    select: { departmentId: true }
                },
                maintainedCourses: {
                    select: { courseId: true }
                },
                accessibleSections: {
                    select: { sectionId: true }
                }
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            userId,
            role: user.role,
            managedDepartmentIds: user.managedDepartments.map(m => m.departmentId),
            maintainedCourseIds: user.maintainedCourses.map(m => m.courseId),
            accessibleSectionIds: user.accessibleSections.map(a => a.sectionId)
        };
    }

    /**
     * Determina se l'utente può vedere una sezione privata
     */
    protected static canAccessPrivateSection(
        sectionId: string, 
        classId: string, 
        permissions: UserPermissions
    ): boolean {
        // SUPERADMIN vede tutto
        if (permissions.role === 'SUPERADMIN') {
            return true;
        }

        // Accesso diretto alla sezione
        if (permissions.accessibleSectionIds.includes(sectionId)) {
            return true;
        }

        // TODO: Per ADMIN e MAINTAINER, dobbiamo verificare se hanno accesso al dipartimento/corso
        // Questo richiede di passare più informazioni o fare query aggiuntive
        return false;
    }

    /**
     * Genera where clause per le sezioni basata sui permessi dell'utente
     */
    protected static async getSectionWhereClause(classId: string, permissions?: UserPermissions) {
        if (!permissions) {
            // Utente non autenticato - solo sezioni pubbliche
            return {
                classId,
                isPublic: true
            };
        }

        if (permissions.role === 'SUPERADMIN') {
            // SUPERADMIN vede tutto
            return { classId };
        }

        if (permissions.role === 'ADMIN') {
            // Admin del dipartimento vede tutto del proprio dipartimento
            const classInfo = await prisma.class.findUnique({
                where: { id: classId },
                include: {
                    course: {
                        select: { departmentId: true }
                    }
                }
            });

            if (classInfo && permissions.managedDepartmentIds.includes(classInfo.course.departmentId)) {
                return { classId };
            }
        }

        // Maintainer o Student o utenti con accessi limitati
        return {
            classId,
            OR: [
                { isPublic: true },
                {
                    id: {
                        in: permissions.accessibleSectionIds
                    }
                }
            ]
        };
    }

    /**
     * Verifica se l'utente può vedere tutte le sezioni di un dipartimento (per ADMIN)
     */
    protected static async canAccessDepartment(departmentId: string, permissions: UserPermissions): Promise<boolean> {
        return permissions.role === 'SUPERADMIN' || 
               (permissions.role === 'ADMIN' && permissions.managedDepartmentIds.includes(departmentId));
    }

    /**
     * Verifica se l'utente può vedere tutte le sezioni di un corso (per MAINTAINER)
     */
    protected static async canAccessCourse(courseId: string, permissions: UserPermissions): Promise<boolean> {
        if (permissions.role === 'SUPERADMIN') return true;
        
        if (permissions.role === 'ADMIN') {
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { departmentId: true }
            });
            return course ? permissions.managedDepartmentIds.includes(course.departmentId) : false;
        }
        
        return permissions.role === 'MAINTAINER' && permissions.maintainedCourseIds.includes(courseId);
    }

    /**
     * Ottieni tutte le classi salvate/preferite dell'utente
     */
    static async getUserSavedClasses(userId: string): Promise<UserClassResponse[]> {
        const userClasses = await prisma.userClass.findMany({
            where: { userId },
            include: {
                class: {
                    include: {
                        course: {
                            include: {
                                department: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return userClasses.map(uc => ({
            userId: uc.userId,
            classId: uc.classId,
            createdAt: uc.createdAt,
            updatedAt: uc.updatedAt,
            class: {
                id: uc.class.id,
                name: uc.class.name,
                code: uc.class.code,
                description: uc.class.description ?? undefined,
                classYear: uc.class.classYear,
                position: uc.class.position,
                course: {
                    id: uc.class.course.id,
                    name: uc.class.course.name,
                    code: uc.class.course.code,
                    courseType: uc.class.course.courseType,
                    department: {
                        id: uc.class.course.department.id,
                        name: uc.class.course.department.name,
                        code: uc.class.course.department.code
                    }
                }
            }
        }));
    }

    /**
     * Aggiungi una classe alla lista preferiti dell'utente
     */
    static async addClassToUserList(userId: string, classId: string): Promise<UserClassResponse> {
        // Verifica che la classe esista
        const classExists = await prisma.class.findUnique({
            where: { id: classId }
        });

        if (!classExists) {
            throw new Error('Classe non trovata');
        }

        // Verifica che l'utente esista
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            throw new Error('Utente non trovato');
        }

        // Verifica che la classe non sia già nella lista
        const existingUserClass = await prisma.userClass.findUnique({
            where: {
                userId_classId: {
                    userId,
                    classId
                }
            }
        });

        if (existingUserClass) {
            throw new Error('La classe è già nella tua lista');
        }

        // Aggiungi la classe alla lista dell'utente
        const userClass = await prisma.userClass.create({
            data: {
                userId,
                classId
            },
            include: {
                class: {
                    include: {
                        course: {
                            include: {
                                department: true
                            }
                        }
                    }
                }
            }
        });

        return {
            userId: userClass.userId,
            classId: userClass.classId,
            createdAt: userClass.createdAt,
            updatedAt: userClass.updatedAt,
            class: {
                id: userClass.class.id,
                name: userClass.class.name,
                code: userClass.class.code,
                description: userClass.class.description ?? undefined,
                classYear: userClass.class.classYear,
                position: userClass.class.position,
                course: {
                    id: userClass.class.course.id,
                    name: userClass.class.course.name,
                    code: userClass.class.course.code,
                    courseType: userClass.class.course.courseType,
                    department: {
                        id: userClass.class.course.department.id,
                        name: userClass.class.course.department.name,
                        code: userClass.class.course.department.code
                    }
                }
            }
        };
    }

    /**
     * Rimuovi una classe dalla lista preferiti dell'utente
     */
    static async removeClassFromUserList(userId: string, classId: string): Promise<RemoveClassFromUserListResponse> {
        // Verifica che la classe sia nella lista dell'utente
        const existingUserClass = await prisma.userClass.findUnique({
            where: {
                userId_classId: {
                    userId,
                    classId
                }
            }
        });

        if (!existingUserClass) {
            throw new Error('La classe non è nella tua lista');
        }

        // Rimuovi la classe dalla lista
        await prisma.userClass.delete({
            where: {
                userId_classId: {
                    userId,
                    classId
                }
            }
        });

        return { success: true, message: 'Classe rimossa dalla tua lista con successo' };
    }

    /**
     * Verifica se una classe è nella lista dell'utente
     */
    static async isClassInUserList(userId: string, classId: string): Promise<boolean> {
        const userClass = await prisma.userClass.findUnique({
            where: {
                userId_classId: {
                    userId,
                    classId
                }
            }
        });

        return !!userClass;
    }
}