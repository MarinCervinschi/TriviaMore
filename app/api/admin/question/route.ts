import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';
import QuizQuestion from '@/types/QuizQuestion';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    if (!questionId) {
        return res.json({ message: 'questionId query parameter is required' }, { status: 400 });
    }


    try {
        const questionData = await prisma.question.findUnique({
            where: { id: questionId },
        }) as QuizQuestion;
        if (!questionData) {
            return res.json({ message: 'Question not found' }, { status: 404 });
        }
        return res.json(questionData, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}


export async function POST(req: Request) {
    const questions: QuizQuestion[] = await req.json();
    if (!questions) {
        return res.json({ message: 'question body is required' }, { status: 400 });
    }

    try {
        if (questions[0].id) {
            // Update question
            const updatedQuestion = await prisma.question.update({
                where: { id: questions[0].id },
                data: questions[0],
            });
            return res.json(updatedQuestion, { status: 200 });
        } else {
            // Create question
            const newQuestions = await prisma.question.createMany({
                data: questions,
            });
            return res.json({ message: 'Question created successfully', newQuestions }, { status: 201 });
        }
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    if (!questionId) {
        return res.json({ message: 'questionId query parameter is required' }, { status: 400 });
    }

    try {
        const deletedQuestion = await prisma.question.delete({
            where: { id: questionId },
        });
        return res.json(deletedQuestion, { status: 200 });
    } catch (error: any) {
        return res.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}