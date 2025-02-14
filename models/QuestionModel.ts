import mongoose, { Schema, Document } from 'mongoose';
import QuizQuestion from "@/types/QuizQuestion";

const QuestionSchema = new Schema({
    classId: { type: String, required: true },
    sectionId: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: [Number], required: true },
});

export default mongoose.models.QuizQuestion || mongoose.model<QuizQuestion & Document>('QuizQuestion', QuestionSchema, 'quizQuestions');