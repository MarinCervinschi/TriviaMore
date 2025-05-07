import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { classId } = req.query;

    if (!classId || typeof classId !== 'string') {
        return res.status(400).json({ message: 'classId query parameter is required' });
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

        const classSections = await prisma.section.findMany({
            where: { classId: classId },
        });

        const filteredSections = classSections.filter(section => section.flashCard === false);
        const filteredFlashCards = classSections.filter(section => section.flashCard === true);

        return res.status(200).json({ class: classData, sections: filteredSections, flashCards: filteredFlashCards });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}