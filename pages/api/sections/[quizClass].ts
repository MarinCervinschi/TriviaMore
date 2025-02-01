import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'quiz-data', 'sections.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const quizClass = req.query.quizClass as string;

  Papa.parse(fileContent, {
    header: true,
    complete: (results: any) => {
        if (quizClass) {
            const filteredResults = results.data.filter((sections: any) => sections.quizClass === quizClass);
            res.status(200).json(filteredResults);
        } else {
            res.status(403).json({ message: 'Section not found' });
        }
    }
  });
}