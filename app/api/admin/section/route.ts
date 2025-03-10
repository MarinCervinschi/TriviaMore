import { PrismaClient } from '@prisma/client';
import exp from 'constants';
import { NextResponse as res } from 'next/server';

const prisma = new PrismaClient();

interface PostData {
    id?: string;
    classId: string;
    sectionName: string;
    icon?: string;
}

export async function POST(req: Request) {
    const section: PostData = await req.json();
    console.log(section);
    
    if (!section || !section.id || !section.classId || !section.sectionName) {
        return res.json({ message: 'section body is required' }, { status: 400 });
    }
    try {
        // Create section
        const newSection = await prisma.section.create({
            data: section,
        });
        return res.json({ message: 'Section created successfully', newSection }, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const section: PostData = await req.json();
    if (!section || !section.id || !section.classId || !section.sectionName) {
        return res.json({ message: 'section body is required' }, { status: 400 });
    }

    try {
        // Update section
        const updatedSection = await prisma.section.update({
            where: { id: section.id },
            data: section,
        });
        return res.json({ message: 'Section updated successfully', updatedSection }, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    if (!sectionId) {
        return res.json({ message: 'sectionId query parameter is required' }, { status: 400 });
    }

    try {
        await prisma.section.delete({
            where: { id: sectionId },
        });
        return res.json({ message: 'Section deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}