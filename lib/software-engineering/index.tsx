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
        get questions() {
            return shuffleArray(softwareEng);
        },
        icon: <FaGears />
    },
    {
        id: "requirements",
        name: "Requirements",
        get questions() {
            return shuffleArray(requirements);
        },
        icon: <GrNotes />
    },
    {
        id: "design",
        name: "Design",
        get questions() {
            return shuffleArray(design);
        },
        icon: <CgIfDesign />
    },
    {
        id: "implementation",
        name: "Implementation",
        get questions() {
            return shuffleArray(implementation);
        },
        icon: <MdEngineering />
    },
    {
        id: "testing",
        name: "Testing",
        get questions() {
            return shuffleArray(testing);
        },
        icon: <GrDocumentTest />
    },
    {
        id: "maintenance",
        name: "Maintenance",
        get questions() {
            return shuffleArray(maintenance);
        },
        icon: <GrConfigure />
    }
];

export default softwareEngineering;