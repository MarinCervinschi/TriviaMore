'use client'

import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";

import softwareEng from "./sections/software-engineering";

const softwareEngineering: QuizSection[] = [
    {
        id: "software-engineering",
        name: "Software Engineering",
        questions: shuffleArray(softwareEng)
    }
];

export default softwareEngineering;