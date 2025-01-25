'use client'

import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";

import softwareEng from "./sections/software-engineering";
import requirements from "./sections/requirements";

import { FaGears } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";


const softwareEngineering: QuizSection[] = [
    {
        id: "software-engineering",
        name: "Software Engineering",
        questions: shuffleArray(softwareEng),
        icon: <FaGears />
    },
    {
        id: "requirements",
        name: "Requirements",
        questions: shuffleArray(requirements),
        icon: <GrNotes />
    }
];

export default softwareEngineering;