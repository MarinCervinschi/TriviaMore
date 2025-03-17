import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import QuizClass from '@/types/QuizClass';
import sections from './sections';
import questions from './data';

const prisma = new PrismaClient();

const classes: QuizClass[] = [
    {
        "name": "Tecnologie Web",
        "visibility": true,
        "icon": "TbWorldCode"
    },
];

const seedSections = async () => {
  try {
    for (const sct of sections) {
      if (typeof sct.icon !== 'string') {
        return;
      }
      await prisma.section.create({
        data: { sectionName: sct.sectionName, icon: sct.icon, class: { connect: { id: sct.classId } } }
      });
    }
    console.log('Sections seeded successfully');
  } catch (error) {
    console.error('Error seeding sections:', error);
  }
};

const seedClasses = async () => {
  try {
    for (const cls of classes) {
      if (typeof cls.icon !== 'string') {
        return;
      }
      await prisma.class.create({
        data: { name: cls.name, icon: cls.icon }
      });
    }
    console.log('Classes seeded successfully');
  } catch (error) {
    console.error('Error seeding classes:', error);
  }
};

const seedQuestions = async () => {
  try {
    for (const q of questions) {
      if (typeof q.question !== 'string' || !Array.isArray(q.options) || !Array.isArray(q.answer)) {
        return;
      }
      console.log(q);
      await prisma.question.create({
        data: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          section: { connect: { id: q.sectionId } },
          class: { connect: { id: q.classId } },
        }
      });
    }
    console.log('Questions seeded successfully');
  } catch (error) {
    console.error('Error seeding questions:', error);
  }
};


//seedClasses();
//seedSections();
//seedQuestions();