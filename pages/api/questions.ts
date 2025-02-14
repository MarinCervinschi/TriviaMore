import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ClassModel from '@/models/ClassModel';
import SectionModel from '@/models/SectionModel';
import QuestionModel from '@/models/QuestionModel';

import QuizQuestion from "@/types/QuizQuestion";
import QuizSection from "@/types/QuizSection";
import QuizClass from "@/types/QuizClass";

import { getRandomQuestions, shuffleArray } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect(); // Ensure database connection

    const { quizClass, quizSection } = req.query;
    if (!quizClass || !quizSection) {
        return res.status(404).json({ message: 'Not found' });
    }

    try {
        // Fetch class from MongoDB
        const classData = await ClassModel.findOne({ id: quizClass }) as QuizClass;
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (quizSection === 'random') {
            // Fetch all questions for the class
            const allQuestions = await QuestionModel.find({ classId: quizClass }).lean() as QuizQuestion[];
            if (!allQuestions.length) {
                return res.status(404).json({ message: 'Questions not found for the given class' });
            }
            const randomQuestions = getRandomQuestions(allQuestions);
            const randomObj = { id: 'random', sectionName: 'Random', icon: 'FaRandom' };
            return res.status(200).json({ quizClass: classData, section: randomObj, questions: randomQuestions });
        } else {
            // Fetch section data
            const sectionData = await SectionModel.findOne({ classId: quizClass, id: quizSection }).lean() as QuizSection;
            if (!sectionData) {
                return res.status(404).json({ message: 'Section not found' });
            }

            // Fetch questions for the section
            const sectionQuestions = await QuestionModel.find({ classId: quizClass, sectionId: quizSection }).lean() as QuizQuestion[];
            if (!sectionQuestions.length) {
                return res.status(404).json({ message: 'Questions not found for the given section' });
            }

            res.status(200).json({ quizClass: classData, section: sectionData, questions: shuffleArray(sectionQuestions) });
        }

    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
    }
}