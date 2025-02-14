import mongoose, { Schema, Document } from 'mongoose';
import QuizSection from "@/types/QuizSection";

const SectionSchema = new Schema({
    id: { type: String, required: true, unique: true },
    classId: { type: String, required: true },
    sectionName: { type: String, required: true },
    icon: { type: String },
});

export default mongoose.models.SectionModel || mongoose.model<QuizSection & Document>('SectionModel', SectionSchema, 'sections');