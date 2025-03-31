import { PrismaClient } from '@prisma/client';
import { NextResponse as res } from 'next/server';
import type { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const visibility = req.cookies.get('admin_token')?.value ? true : false;

    try {
        const classes = await prisma.class.findMany();
        if (visibility) {
            return res.json(classes);
        }
        const filteredClasses = classes.filter(c => c.visibility);
        return res.json(filteredClasses);
    } catch (error) {
        console.error('Error fetching classes:', error);
        return res.json({ message: 'Error fetching classes' }, { status: 500 });
    }
}