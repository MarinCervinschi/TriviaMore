import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import QuizQuestion from '@/types/QuizQuestion';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { questionId } = req.query;
        if (!questionId || typeof questionId !== 'string') {
            return res.status(400).json({ message: 'questionId query parameter is required' });
        }

        try {
            const questionData = await prisma.question.findUnique({
                where: { id: questionId },
            }) as QuizQuestion;
            if (!questionData) {
                return res.status(404).json({ message: 'Question not found' });
            }
            return res.status(200).json(questionData);
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else if (req.method === 'POST') {
        const questions: QuizQuestion[] = req.body;
        if (!questions) {
            return res.status(400).json({ message: 'question body is required' });
        }

        try {
            if (questions[0].id) {
                // Update question
                const updatedQuestion = await prisma.question.update({
                    where: { id: questions[0].id },
                    data: questions[0],
                });
                return res.status(200).json(updatedQuestion);
            } else {
                // Create question
                const newQuestions = await prisma.question.createMany({
                    data: questions,
                });
                return res.status(201).json({ message: 'Question created successfully', newQuestions });
            }
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else if (req.method === 'DELETE') {
        const { questionId } = req.query;
        if (!questionId || typeof questionId !== 'string') {
            return res.status(400).json({ message: 'questionId query parameter is required' });
        }

        try {
            const deletedQuestion = await prisma.question.delete({
                where: { id: questionId },
            });
            return res.status(200).json(deletedQuestion);
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}