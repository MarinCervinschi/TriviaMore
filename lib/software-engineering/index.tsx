'use client'

import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";

import softwareEng from "./sections/software-engineering";
import requirements from "./sections/requirements";
import design from "./sections/design";
import implementation from "./sections/implementation";
import testing from "./sections/testing";
import maintenance from "./sections/maintenance";

import { FaGears } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";
import { CgIfDesign } from "react-icons/cg";
import { MdEngineering } from "react-icons/md";
import { GrDocumentTest } from "react-icons/gr";
import { GrConfigure } from "react-icons/gr";

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
    },
    {
        id: "implementation",
        name: "Implementation",
        questions: shuffleArray(implementation),
        icon: <MdEngineering />
    },
    {
        id: "testing",
        name: "Testing",
        questions: shuffleArray(testing),
        icon: <GrDocumentTest />
    },
    {
        id: "maintenance",
        name: "Maintenance",
        questions: shuffleArray(maintenance),
        icon: <GrConfigure />
    }
];

export default softwareEngineering;