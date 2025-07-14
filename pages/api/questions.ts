import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRandomQuestions, shuffleArray } from '@/lib/utils'; // Assuming utils.ts is in lib folder


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { classId, sectionId } = req.query;

    if (!classId || typeof classId !== 'string' || !sectionId || typeof sectionId !== 'string') {
        return res.status(400).json({ message: 'classId and sectionId query parameters are required' });
    }

    const visibility = req.cookies.admin_token ? true : false;

    try {
        const classData = await prisma.class.findUnique({
            where: {
                id: classId,
            },
        });

        if (!classData || (!visibility && !classData.visibility)) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (sectionId === 'random') {
            // Fetch all questions for the class
            const allQuestions = await prisma.question.findMany({
                where: { classId: classId },
            });

            if (!allQuestions.length) {
                return res.status(404).json({ message: 'Questions not found for the given class' });
            }

            const onlyQuestions = allQuestions.filter((q) => !q.sectionId?.includes('-flash'));

            const randomQuestions = getRandomQuestions(onlyQuestions);
            const randomObj = { id: 'random', sectionName: 'Random', icon: 'FaRandom' };
            return res.status(200).json({ quizClass: classData, section: randomObj, questions: randomQuestions });
        } else {
            // Fetch section data
            const sectionData = await prisma.section.findUnique({
                where: { id: sectionId, classId: classId },
            });

            if (!sectionData) {
                return res.status(404).json({ message: 'Section not found' });
            }

            // Fetch questions for the section
            const sectionQuestions = await prisma.question.findMany({
                where: { classId: classId, sectionId: sectionId },
            });
            return res.status(200).json({ quizClass: classData, section: sectionData, questions: shuffleArray(sectionQuestions) });
        }
    } catch (error: any) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}