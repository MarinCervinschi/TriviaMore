import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ClassModel from '@/models/ClassModel';
import SectionModel from '@/models/SectionModel';

import QuizClass from '@/types/QuizClass';
import QuizSection from '@/types/QuizSection';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Ensure database connection
  
  const { quizClass } = req.query;
  if (!quizClass) {
    return res.status(400).json({ message: 'quizClass query parameter is required' });
  }

  try {
    // Fetch class data from MongoDB
    const classData = await ClassModel.findOne({ id: quizClass }).lean() as QuizClass;
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Fetch sections associated with this class
    const classSections = await SectionModel.find({ classId: quizClass }) as QuizSection[];
    if (!classSections.length) {
      return res.status(404).json({ message: 'Sections not found for the given class' });
    }

    res.status(200).json({ class: classData, sections: classSections });
  } catch (error: any) {
    res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
  }
}