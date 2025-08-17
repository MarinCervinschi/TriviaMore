import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
		}

		const userId = session.user.id;

		// Fetch user permissions from database
		const [managedDepartments, maintainedCourses] = await Promise.all([
			// Get departments managed by this user (ADMIN role)
			prisma.departmentAdmin.findMany({
				where: { userId },
				select: { departmentId: true },
			}),
			// Get courses maintained by this user (MAINTAINER role)
			prisma.courseMaintainer.findMany({
				where: { userId },
				select: { courseId: true },
			}),
		]);

		const permissions = {
			managedDepartmentIds: managedDepartments.map(item => item.departmentId),
			maintainedCourseIds: maintainedCourses.map(item => item.courseId),
		};

		return NextResponse.json(permissions);
	} catch (error) {
		console.error("Error fetching user permissions:", error);
		return NextResponse.json(
			{ error: "Errore nel recupero dei permessi utente" },
			{ status: 500 }
		);
	}
}
