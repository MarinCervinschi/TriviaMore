import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import QuizQuestion from '@/types/QuizQuestion';
import { getRandomQuestions } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const quizClass = req.query.quizClass as string;
    const section = req.query.section as string;

    if (!quizClass || !section) {
        return res.status(404).json({ message: 'Not found' });
    }

    try {
        const classesPath = path.join(process.cwd(), 'quiz-data', 'classes.json');
        const sectionsPath = path.join(process.cwd(), 'quiz-data', 'sections.json');
        const questionsPath = path.join(process.cwd(), 'quiz-data/questions/', `${quizClass}.json`);


        // Read JSON files asynchronously
        const [classesContent, sectionsContent, questionsContent] = await Promise.all([
            fs.readFile(classesPath, 'utf8'),
            fs.readFile(sectionsPath, 'utf8'),
            fs.readFile(questionsPath, 'utf8')
        ]);

        const classesData = JSON.parse(classesContent).classes;
        const sectionsData = JSON.parse(sectionsContent);
        const questionsData = JSON.parse(questionsContent);

        const classData = classesData.find((cls: any) => cls.id === quizClass);
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (section === 'random') {
            const allQuestions = Object.values(questionsData).flat() as QuizQuestion[];
            const randomQuestions = getRandomQuestions(allQuestions);
            return res.status(200).json({ quizClass: classData, section: sectionsData[section][0], questions: randomQuestions });
        } else {
            const sectionData = sectionsData[quizClass]?.find((sec: any) => sec.id === section);
            if (!sectionData) {
                return res.status(404).json({ message: 'Section not found' });
            }
            const sectionQuestions = questionsData[section] || [];

            res.status(200).json({ quizClass: classData, section: sectionData, questions: sectionQuestions });
        }

    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
    }
}