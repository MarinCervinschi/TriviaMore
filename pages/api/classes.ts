import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'quiz-data', 'classes.json');
  
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    res.status(200).json(jsonData.classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read file' });
  }
}