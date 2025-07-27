import { prisma } from "./prisma";
import fs from "fs";
import path from "path";

const dataPath = path.join(__dirname, "data.json");
const rawData = fs.readFileSync(dataPath, "utf-8");
const questions = JSON.parse(rawData);

async function updateQuestions() {
    for (const question of questions) {
        await prisma.question.update({
            where: { id: question.id },
            data: question,
        });
    }
}

updateQuestions()
    .then(() => {
        console.log("Questions updated successfully.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error updating questions:", err);
        process.exit(1);
    });