import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const quizClass = req.query.quizClass as string;
    const section = req.query.section as string;

    if (!quizClass || !section) {
        res.status(404).json({ message: 'Not found' });
        return;
    }

    try {
        const classesPath = path.join(process.cwd(), 'quiz-data', 'classes.json');
        const sectionsPath = path.join(process.cwd(), 'quiz-data', 'sections.json');
        const questionsPath = path.join(process.cwd(), 'quiz-data/questions/', `${quizClass}.json`);

        // Read JSON files
        const classesData = JSON.parse(fs.readFileSync(classesPath, 'utf8')).classes;
        const sectionsData = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'));
        const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

        // Find class data
        const classData = classesData.find((cls: any) => cls.id === quizClass);
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const sectionData = sectionsData[quizClass].find((sec: any) => sec.id === section);
        if (!sectionData) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.status(200).json({ quizClass: classData, section: sectionData, questions: questionsData[section] });
    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
    }
}
