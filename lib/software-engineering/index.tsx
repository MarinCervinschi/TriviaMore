'use client'

import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";

import softwareEng from "./sections/software-engineering";

import { FaGears } from "react-icons/fa6";

const softwareEngineering: QuizSection[] = [
    {
        id: "software-engineering",
        name: "Software Engineering",
        questions: shuffleArray(softwareEng),
        icon: <FaGears />
    }
];

export default softwareEngineering;