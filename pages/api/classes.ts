import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'quiz-data', 'classes.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const jsonData = JSON.parse(fileContent);
  res.status(200).json(jsonData.classes);
}