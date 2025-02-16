import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';

const prisma = new PrismaClient();
interface PostData {
    classId: string;
    sectionName: string;
    icon?: string | "default";
}

export async function POST(req: Request) {
    const { classId, sectionName, icon } = await req.json() as PostData;
    if (!classId || !sectionName) {
        return res.json({ message: 'classId and sectionName are required' }, { status: 400 });
    }

    try {
        const classData = await prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            return res.json({ message: 'Class not found' }, { status: 404 });
        }

        await prisma.section.create({
            data: {
                sectionName,
                icon,
                class: { connect: { id: classId } }
            }
        });

        return res.json({ message: 'Section created successfully'}, { status: 201 });
    } catch (error) {
        console.error(error);
        return res.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

