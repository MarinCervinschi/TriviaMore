import mongoose, { Schema, Document } from 'mongoose';
import QuizClass from '@/types/QuizClass';

const ClassSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String },
});

export default mongoose.models.ClassModel || mongoose.model<QuizClass & Document>('ClassModel', ClassSchema, 'classes');