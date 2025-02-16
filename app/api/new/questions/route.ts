import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';
import QuizQuestion from '@/types/QuizQuestion';

const prisma = new PrismaClient();

interface PostData {
    classId: string;
    sectionId: string;
    questions: QuizQuestion[];
}

export async function POST(req: Request) {
    const { classId, sectionId, questions } = await req.json() as PostData;
    if (!classId || !sectionId || !questions) {
        return res.json({ message: 'classId, sectionId, and questions are required' }, { status: 400 });
    }

    try {
        const classData = await prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            return res.json({ message: 'Class not found' }, { status: 404 });
        }

        const sectionData = await prisma.section.findUnique({
            where: { id: sectionId, classId: classId },
        });
        if (!sectionData) {
            return res.json({ message: 'Section not found' }, { status: 404 });
        }

        await prisma.question.createMany({
            data: questions.map((q: QuizQuestion) => ({
                question: q.question,
                options: q.options,
                answer: q.answer,
                classId: classId,
                sectionId: sectionId,
            })),
        });

        return res.json({ message: 'Questions created successfully' }, { status: 201 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}