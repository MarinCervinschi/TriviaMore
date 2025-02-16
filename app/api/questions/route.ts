import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';
import { getRandomQuestions, shuffleArray } from '@/lib/utils';
import QuizQuestion from '@/types/QuizQuestion';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    if (!classId || !sectionId) {
        return res.json({ message: 'classId and sectionId query parameters are required' }, { status: 400 });
    }

    try {
        const classData = await prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            return res.json({ message: 'Class not found' }, { status: 404 });
        }

        if (sectionId === 'random') {
            // Fetch all questions for the class
            const allQuestions = await prisma.question.findMany({
                where: { classId: classId },
            });
            if (!allQuestions.length) {
                return res.json({ message: 'Questions not found for the given class' }, { status: 404 });
            }
            const randomQuestions = getRandomQuestions(allQuestions);
            const randomObj = { id: 'random', sectionName: 'Random', icon: 'FaRandom' };
            return res.json({ quizClass: classData, section: randomObj, questions: randomQuestions }, { status: 200 });
        } else {
            // Fetch section data
            const sectionData = await prisma.section.findUnique({
                where: { id: sectionId, classId: classId },
            });
            if (!sectionData) {
                return res.json({ message: 'Section not found' }, { status: 404 });
            }

            // Fetch questions for the section
            const sectionQuestions = await prisma.question.findMany({
                where: { classId: classId, sectionId: sectionId },
            });
            return res.json({ quizClass: classData, section: sectionData, questions: shuffleArray(sectionQuestions) }, { status: 200 });
        }
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}