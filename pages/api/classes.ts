import { NextApiRequest, NextApiResponse } from 'next';
import ClassModel from '@/models/ClassModel';
import dbConnect from '@/lib/mongodb';
import QuizClass from "@/types/QuizClass";

export default async function hundler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Ensure database connection

  try {
    const classes = await ClassModel.find({}).lean() as QuizClass[]; // Fetch all class data
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
}