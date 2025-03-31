import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';
import type { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    if (!classId) {
        return res.json({ message: 'classId query parameter is required' }, { status: 400 });
    }
    const visibility = req.cookies.get('admin_token')?.value ? true : false;

    try {
        const classData = await prisma.class.findUnique({
            where: {
                id: classId,
            },
        });
        if (!classData || (!visibility && !classData.visibility)) {
            return res.json({ message: 'Class not found' }, { status: 404 });
        }

        const classSections = await prisma.section.findMany({
            where: { classId: classId },
        });

        return res.json({ class: classData, sections: classSections });
    } catch (error) {
        console.error(error);
        return res.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}