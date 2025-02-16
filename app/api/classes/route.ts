import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';

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