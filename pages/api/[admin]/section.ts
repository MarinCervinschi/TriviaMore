import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

interface PostData {
    id?: string;
    classId: string;
    sectionName: string;
    icon?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const section: PostData = req.body;

        if (!section || !section.id || !section.classId || !section.sectionName) {
            return res.status(400).json({ message: 'section body is required' });
        }
        try {
            // Create section
            const newSection = await prisma.section.create({
                data: section,
            });
            return res.status(200).json({ message: 'Section created successfully', newSection });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else if (req.method === 'PUT') {
        const section: PostData = req.body;
        if (!section || !section.id || !section.classId || !section.sectionName) {
            return res.status(400).json({ message: 'section body is required' });
        }

        try {
            // Update section
            const updatedSection = await prisma.section.update({
                where: { id: section.id },
                data: section,
            });
            return res.status(200).json({ message: 'Section updated successfully', updatedSection });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else if (req.method === 'DELETE') {
        const { sectionId } = req.query;
        if (!sectionId || typeof sectionId !== 'string') {
            return res.status(400).json({ message: 'sectionId query parameter is required' });
        }

        try {
            await prisma.section.delete({
                where: { id: sectionId },
            });
            return res.status(200).json({ message: 'Section deleted successfully' });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}