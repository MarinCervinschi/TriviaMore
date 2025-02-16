import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';

const prisma = new PrismaClient();

interface PostData {
    name: string;
    icon?: string | "default";
}

export async function POST(req: Request) {
    const { name, icon } = await req.json() as PostData;
    if (!name) {
        return res.json({ message: 'name is required' }, { status: 400 });
    }

    try {
        await prisma.class.create({
            data: { name, icon }
        });
        return res.json({ message: 'Class created successfully' });
    } catch (error) {
        console.error('Error creating class:', error);
        return res.json({ message: 'Error creating class' }, { status: 500 });
    }
}