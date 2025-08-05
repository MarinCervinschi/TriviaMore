
import { prisma } from '@/lib/prisma';

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
}