import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ClassModel from '@/models/ClassModel';
import SectionModel from '@/models/SectionModel';
import QuestionModel from '@/models/QuestionModel';
import { getRandomQuestions, shuffleArray } from '@/lib/utils';
import QuizQuestion from '@/types/QuizQuestion';
import QuizSection from '@/types/QuizSection';
import QuizClass from '@/types/QuizClass';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect(); // Ensure database connection

    const quizClass = req.query.quizClass as string;
    const section = req.query.section as string;

    if (!quizClass || !section) {
        return res.status(404).json({ message: 'Not found' });
    }

    try {
        // Fetch class from MongoDB
        const classData = await ClassModel.findOne({ id: quizClass }) as QuizClass;
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (section === 'random') {
            // Fetch all questions for the class
            const allQuestions = await QuestionModel.find({ classId: quizClass }).lean() as QuizQuestion[];
            const randomQuestions = getRandomQuestions(allQuestions);
            const randomObj = { id: 'random', sectionName: 'Random', icon: 'FaRandom' };
            return res.status(200).json({ quizClass: classData, section: randomObj, questions: randomQuestions });
        } else {
            // Fetch section data
            const sectionData = await SectionModel.findOne({ classId: quizClass, id: section }).lean() as QuizSection;
            if (!sectionData) {
                return res.status(404).json({ message: 'Section not found' });
            }

            // Fetch questions for the section
            console.log('quizClass', quizClass);
            console.log('section', section);
            const sectionQuestions = await QuestionModel.find({ classId: quizClass, sectionId: section }).lean() as QuizQuestion[];

            res.status(200).json({ quizClass: classData, section: sectionData, questions: shuffleArray(sectionQuestions) });
        }

    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
    }
}