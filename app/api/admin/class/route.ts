import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';

const prisma = new PrismaClient();

interface PostData {
    id?: string;
    name: string;
    visibility: boolean;
    icon?: string;
}

export async function POST(req: Request) {
    const classData: PostData = await req.json();

    if (!classData || !classData.id || !classData.name) {
        return res.json({ message: 'class body is invalid' }, { status: 400 });
    }

    try {
        const newClass = await prisma.class.create({
            data: classData,
        });
        return res.json({ message: 'Class created successfully', newClass }, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const classData: PostData = await req.json();

    if (!classData || !classData.id || !classData.name) {
        return res.json({ message: 'class body is invalid' }, { status: 400 });
    }

    try {
        const updatedClass = await prisma.class.update({
            where: { id: classData.id },
            data: classData,
        });
        return res.json({ message: 'Class updated successfully', updatedClass }, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    if (!classId) {
        return res.json({ message: 'classId query parameter is required' }, { status: 400 });
    }

    try {
        await prisma.class.delete({
            where: { id: classId },
        });
        return res.json({ message: 'Class deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
