import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const quizClass = req.query.quizClass as string;

    if (!quizClass) {
        return res.status(404).json({ message: 'Not found' });
    }

    try {
        const questionsPath = path.join(process.cwd(), 'quiz-data/questions/', `${quizClass}.json`);

        // Parse JSON files
        const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

        res.status(200).json({ questions: questionsData.values });
    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
    }
}
