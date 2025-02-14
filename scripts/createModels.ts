import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import ClassModel from '../models/ClassModel';
import SectionModel from '../models/SectionModel';
import QuestionModel from '../models/QuestionModel';

const createCollections = async () => {
  await dbConnect();

  try {
    console.log('🔄 Creating collections in MongoDB...');

    // Force collection creation by ensuring indexes
    await ClassModel.syncIndexes();
    await SectionModel.syncIndexes();
    await QuestionModel.syncIndexes();

    console.log('✅ Collections are ready in MongoDB!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    mongoose.connection.close();
  }
};

createCollections();