import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import SectionModel from '../models/SectionModel';
import QuestionModel from '../models/QuestionModel';

import QuizQuestion from '../types/QuizQuestion';
import QuizSection from '../types/QuizSection';


const sections: QuizSection[] = [
  { id: 'dishi', classId: 'calcolatori', sectionName: 'Dischi' },
];

import quizQuestions from './data';

// Function to seed database
const seedDatabase = async () => {
  await dbConnect(); // Connect to MongoDB

  try {
    console.log('🌱 Seeding database...');

    // Insert new data
    await SectionModel.insertMany(sections);
    await QuestionModel.insertMany(quizQuestions);

    console.log('✅ Database initialized successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    mongoose.connection.close();
  }
};

// Run the seed function
seedDatabase();