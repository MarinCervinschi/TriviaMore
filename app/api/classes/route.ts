import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';
import { serializeId } from '@/lib/utils';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const classes = await prisma.class.findMany();
        return res.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        return res.json({ message: 'Error fetching classes' }, { status: 500 });
    }
}

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
        const id = serializeId(name);
        await prisma.class.create({
            data: { id, name, icon }
        });
        return res.json({ message: 'Class created successfully' });
    } catch (error) {
        console.error('Error creating class:', error);
        return res.json({ message: 'Error creating class' }, { status: 500 });
    }
}