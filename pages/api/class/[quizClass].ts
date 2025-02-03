import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const quizClass = req.query.quizClass as string;

  if (!quizClass) {
    return res.status(400).json({ message: 'quizClass query parameter is required' });
  }

  try {
    const sectionsPath = path.join(process.cwd(), 'quiz-data', 'sections.json');
    const classesPath = path.join(process.cwd(), 'quiz-data', 'classes.json');

    // Read JSON files asynchronously
    const [sectionsFileContent, classesFileContent] = await Promise.all([
      fs.readFile(sectionsPath, 'utf8'),
      fs.readFile(classesPath, 'utf8'),
    ]);

    // Parse JSON data
    const sectionsData = JSON.parse(sectionsFileContent);
    const classesData = JSON.parse(classesFileContent).classes;

    // Find class data
    const classData = classesData.find((cls: any) => cls.id === quizClass);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if sections exist for the given class
    const classSections = sectionsData[quizClass];
    if (!classSections) {
      return res.status(404).json({ message: 'Sections not found for the given class' });
    }

    res.status(200).json({ class: classData, sections: classSections });
  } catch (error: any) {
    res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
  }
}