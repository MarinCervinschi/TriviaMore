import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

interface PostData {
    id?: string;
    name: string;
    visibility: boolean;
    icon?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const classData: PostData = await req.body;

        if (!classData || !classData.id || !classData.name) {
            return res.status(400).json({ message: 'class body is invalid' });
        }

        try {
            const newClass = await prisma.class.create({
                data: classData,
            });
            return res.status(200).json({ message: 'Class created successfully', newClass });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else if (req.method === 'PUT') {
        const classData: PostData = await req.body;

        if (!classData || !classData.id || !classData.name) {
            return res.status(400).json({ message: 'class body is invalid' });
        }

        try {
            const updatedClass = await prisma.class.update({
                where: { id: classData.id },
                data: classData,
            });
            return res.status(200).json({ message: 'Class updated successfully', updatedClass });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else if (req.method === 'DELETE') {
        const { classId } = req.query;
        if (!classId || typeof classId !== 'string') {
            return res.status(400).json({ message: 'classId query parameter is required' });
        }

        try {
            await prisma.class.delete({
                where: { id: classId },
            });
            return res.status(200).json({ message: 'Class deleted successfully' });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}