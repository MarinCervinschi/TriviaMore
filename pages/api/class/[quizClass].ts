import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const quizClass = req.query.quizClass as string;

  if (!quizClass) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const sectionsPath = path.join(process.cwd(), 'quiz-data', 'sections.json');
    const classesPath = path.join(process.cwd(), 'quiz-data', 'classes.json');

    // Read JSON files
    const sectionsFileContent = fs.readFileSync(sectionsPath, 'utf8');
    const classesFileContent = fs.readFileSync(classesPath, 'utf8');

    // Parse JSON files
    const sectionsData = JSON.parse(sectionsFileContent);
    const classesData = JSON.parse(classesFileContent).classes;

    // Find class data
    const classData = classesData.find((cls: any) => cls.id === quizClass);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.status(200).json({ class: classData, sections: sectionsData[quizClass] });
  } catch (error: any) {
    res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
  }
}
