'use client'

import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";

import softwareEng from "./sections/software-engineering";
import requirements from "./sections/requirements";
import design from "./sections/design";

import { FaGears } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";
import { CgIfDesign } from "react-icons/cg";





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
    },
    {
        id: "design",
        name: "Design",
        questions: shuffleArray(design),
        icon: <CgIfDesign />
    }
];

export default softwareEngineering;