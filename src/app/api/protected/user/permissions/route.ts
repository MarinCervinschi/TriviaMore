import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// api/protected/user/permissions

export const GET = auth(async function GET(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const [managedDepartments, maintainedCourses] = await Promise.all([
			prisma.departmentAdmin.findMany({
				where: { userId },
				select: { departmentId: true },
			}),
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
});
